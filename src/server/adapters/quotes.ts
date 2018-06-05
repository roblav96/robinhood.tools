// 

export * from '../../common/quotes'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as quotes from '../../common/quotes'
import * as iex from '../../common/iex'
import * as redis from '../adapters/redis'
import * as utils from '../adapters/utils'
import * as hours from '../adapters/hours'
import * as pAll from 'p-all'



export async function getAlls(symbols: string[], allrkeys = Object.keys(quotes.ALL_RKEYS) as Quotes.AllKeys[], allkeys = [] as string[][]) {
	let resolved = await redis.main.coms(_.flatten(symbols.map(v => {
		return allrkeys.map((k, i) => {
			let rkey = `${quotes.ALL_RKEYS[k]}:${v}`
			let ikeys = allkeys[i]
			if (Array.isArray(ikeys)) {
				return ['hmget', rkey].concat(ikeys)
			}
			return ['hgetall', rkey]
		})
	})))
	let ii = 0
	return symbols.map(symbol => {
		let all = { symbol } as Quotes.All
		allrkeys.forEach((k, i) => {
			let resolve = resolved[ii++]
			let ikeys = allkeys[i]
			if (Array.isArray(ikeys)) {
				resolve = redis.fixHmget(resolve, ikeys)
			}
			core.fix(resolve)
			all[k] = resolve
		})
		return all
	})
}

export async function syncAllQuotes(resets = false) {
	let symbols = await utils.getAllSymbols()
	if (process.env.DEVELOPMENT) {
		// let ikeys = ['bidSize', 'bidVolume', 'bidSpread', 'askSize', 'askVolume', 'askSpread'] as KeysOf<Quotes.Quote>
		// let coms = symbols.map(v => ['hdel', `${rkeys.QUOTES}:${v}`].concat(ikeys))
		// await redis.main.coms(coms)
	}
	let chunks = core.array.chunks(symbols, _.ceil(symbols.length / 256))
	await pAll(chunks.map((chunk, i) => async () => {
		if (process.env.DEVELOPMENT) console.log('syncAllQuotes ->', `${_.round((i / chunks.length) * 100)}%`);
		let alls = await getAlls(chunk)
		await redis.main.coms(alls.map(all => {
			let rkey = `${rkeys.QUOTES}:${all.symbol}`
			return ['hmset', rkey, initFullQuote(all, resets) as any]
		}))
	}), { concurrency: 1 })
	if (process.env.DEVELOPMENT) console.info('syncAllQuotes done ->');
}



export function initFullQuote(
	{ symbol, quote, wbticker, wbquote, instrument, yhquote, iexitem }: Quotes.All,
	resets = false,
) {

	core.object.merge(quote, {
		symbol,
		tickerId: wbticker.tickerId,
		typeof: wbquote.typeof,
		timezone: wbquote.utcOffset,
		currency: wbquote.currency,
		sector: iexitem.sector,
		industry: iexitem.industry,
		website: iexitem.website,
		alive: instrument.alive,
		mic: instrument.mic,
		acronym: instrument.acronym,
		description: iexitem.description,
		issueType: iex.ISSUE_TYPES[iexitem.issueType],
		listDate: new Date(instrument.list_date).valueOf(),
		country: core.fallback(instrument.country, wbquote.countryISOCode, wbquote.regionAlias, wbticker.regionIsoCode),
		exchange: core.fallback(iexitem.exchange, iexitem.primaryExchange, wbticker.exchangeCode, wbticker.disExchangeCode),
		sharesOutstanding: _.round(core.fallback(wbquote.totalShares, yhquote.sharesOutstanding, iexitem.sharesOutstanding)),
		sharesFloat: _.round(core.fallback(wbquote.outstandingShares, iexitem.float)),
	} as Quotes.Quote)

	quote.name = core.fallback(iexitem.companyName, instrument.simple_name, yhquote.shortName, wbticker.tinyName, wbticker.name)
	quote.tinyName = core.fallback(instrument.simple_name, yhquote.shortName, quote.name)
	quote.fullName = core.fallback(instrument.name, yhquote.longName, wbticker.name, quote.name)

	quote.avgVolume10Day = _.round(core.fallback(wbquote.avgVol10D, yhquote.averageDailyVolume10Day))
	quote.avgVolume3Month = _.round(core.fallback(wbquote.avgVol3M, yhquote.averageDailyVolume3Month))
	quote.avgVolume = _.round(core.fallback(wbquote.avgVolume, _.round(quote.avgVolume10Day, quote.avgVolume3Month)))

	{
		let toquote = applyWbQuote(quote, wbquote)
		resets ? core.object.merge(quote, toquote) : core.object.repair(quote, toquote)
	}
	{
		let toquote = resetFull(quote)
		resets ? core.object.merge(quote, toquote) : core.object.repair(quote, toquote)
	}
	mergeCalcs(quote)

	return quote

}



export function resetLive(quote: Quotes.Calc) {
	return {
		size: 0,
		dealSize: 0, dealFlowSize: 0,
		buySize: 0, sellSize: 0,
		bidSize: 0, askSize: 0,
		spreadFlowSize: 0,
		bidSpread: quote.bid, askSpread: quote.ask,
		open: quote.price, high: quote.price, low: quote.price, close: quote.price,
	} as Quotes.Calc
}

export function resetFull(quote: Quotes.Calc) {
	let toquote = resetLive(quote)
	Object.keys(toquote).forEach(key => {
		if (key.includes('size')) {
			toquote[key.replace('size', 'volume')] = 0
		}
		else if (key.includes('Size')) {
			toquote[key.replace('Size', 'Volume')] = 0
		}
	})
	core.object.merge(toquote, {
		liveCount: 0, dealCount: 0,
		turnoverRate: 0, vibrateRatio: 0, yield: 0,
		startPrice: quote.price,
		dayHigh: quote.price, dayLow: quote.price,
	} as Quotes.Calc)
	return toquote
}



export function toDeal(wbdeal: Webull.Deal) {
	return {
		price: wbdeal.deal,
		flag: wbdeal.tradeBsFlag,
		size: wbdeal.volume,
		symbol: wbdeal.symbol,
		timestamp: wbdeal.tradeTime,
	} as Quotes.Deal
}

export function applyDeal(quote: Quotes.Calc, deal: Quotes.Deal, toquote = {} as Quotes.Calc) {

	if (quote.timestamp < deal.timestamp) {
		toquote.timestamp = deal.timestamp
		if (quote.price != deal.price) {
			toquote.price = deal.price
		}
	}

	toquote.dealCount = core.math.sum(quote.dealCount, 1)
	toquote.dealSize = core.math.sum(quote.dealSize, deal.size)
	toquote.dealVolume = core.math.sum(quote.dealVolume, deal.size)

	if (deal.flag == 'B') {
		toquote.buySize = core.math.sum(quote.buySize, deal.size)
		toquote.buyVolume = core.math.sum(quote.buyVolume, deal.size)
	} else if (deal.flag == 'S') {
		toquote.sellSize = core.math.sum(quote.sellSize, deal.size)
		toquote.sellVolume = core.math.sum(quote.sellVolume, deal.size)
	} else {
		toquote.size = core.math.sum(quote.size, deal.size)
		toquote.volume = core.math.sum(quote.volume, deal.size)
	}

	return toquote
}



interface KeyMapValue { key: keyof Quotes.Calc, time: boolean, greater: boolean }
export const KEY_MAP = (({
	'faStatus': ({ key: 'status' } as KeyMapValue) as any,
	'status': ({ key: 'status' } as KeyMapValue) as any,
	// 
	'open': ({ key: 'openPrice' } as KeyMapValue) as any,
	'close': ({ key: 'closePrice' } as KeyMapValue) as any,
	'preClose': ({ key: 'prevClose' } as KeyMapValue) as any,
	// 
	// 'high': ({ key: 'dayHigh' } as KeyMapValue) as any,
	// 'low': ({ key: 'dayLow' } as KeyMapValue) as any,
	'fiftyTwoWkHigh': ({ key: 'yearHigh' } as KeyMapValue) as any,
	'fiftyTwoWkLow': ({ key: 'yearLow' } as KeyMapValue) as any,
	// 
	'bid': ({ key: 'bid' } as KeyMapValue) as any,
	'ask': ({ key: 'ask' } as KeyMapValue) as any,
	'bidSize': ({ key: 'bids' } as KeyMapValue) as any,
	'askSize': ({ key: 'asks' } as KeyMapValue) as any,
	// 
	'quoteMaker': ({ key: 'quoteMaker' } as KeyMapValue) as any,
	'quoteMakerAddress': ({ key: 'quoteMakerAddress' } as KeyMapValue) as any,
	// 
	'turnoverRate': ({ key: 'turnoverRate' } as KeyMapValue) as any,
	'vibrateRatio': ({ key: 'vibrateRatio' } as KeyMapValue) as any,
	'yield': ({ key: 'yield' } as KeyMapValue) as any,
	// 
	'totalShares': ({ key: 'sharesOutstanding' } as KeyMapValue) as any,
	'outstandingShares': ({ key: 'sharesFloat' } as KeyMapValue) as any,
	// 
	'faTradeTime': ({ key: 'timestamp', time: true } as KeyMapValue) as any,
	'tradeTime': ({ key: 'timestamp', time: true } as KeyMapValue) as any,
	'mktradeTime': ({ key: 'timestamp', time: true } as KeyMapValue) as any,
	// 
	'dealNum': ({ key: 'dealCount', greater: true } as KeyMapValue) as any,
	'volume': ({ key: 'volume', greater: true } as KeyMapValue) as any,
	'dealAmount': ({ key: 'dealCount', greater: true } as KeyMapValue) as any,
	// '____': ({ key: '____' } as KeyMapValue) as any,
} as Webull.Quote) as any) as Dict<KeyMapValue>

export function applyKeyMap(keymap: KeyMapValue, toquote: any, tokey: string, to: any, from: any) {
	if (keymap && keymap.time) {
		if (to > from) toquote[tokey] = to;
	}
	else if (keymap && keymap.greater) {
		if (to < from) {
			if (core.calc.percent(to, from) < -10) toquote[tokey] = to;
		}
		else if (to > from) toquote[tokey] = to;
	}
	else if (to != from) {
		toquote[tokey] = to
	}
}



export function applyWbQuote(quote: Quotes.Calc, wbquote: Webull.Quote, toquote = {} as Quotes.Calc) {

	Object.keys(wbquote).forEach(key => {
		let wbvalue = wbquote[key]
		let keymap = KEY_MAP[key]
		if (!keymap || !keymap.key) return;

		let qkey = keymap.key
		let qvalue = quote[qkey]
		if (qvalue == null) { qvalue = wbvalue; quote[qkey] = wbvalue; toquote[qkey] = wbvalue }

		applyKeyMap(keymap, toquote, qkey, wbvalue, qvalue)

	})

	if (toquote.timestamp) {
		if (wbquote.mktradeTime == toquote.timestamp && wbquote.price && wbquote.price != quote.price) {
			toquote.price = wbquote.price
		}
		if (wbquote.faTradeTime == toquote.timestamp && wbquote.pPrice && wbquote.pPrice != quote.price) {
			toquote.price = wbquote.pPrice
		}
	}

	if (toquote.volume) {
		toquote.size = quote.size + (toquote.volume - quote.volume)
	}

	if (toquote.bid) {
		toquote.bidSpread = core.math.min(quote.bidSpread, quote.bid, toquote.bid)
	}
	if (toquote.ask) {
		toquote.askSpread = core.math.max(quote.askSpread, quote.ask, toquote.ask)
	}
	if (toquote.bids) {
		toquote.bidSize = core.math.sum(quote.bidSize, toquote.bids)
		toquote.bidVolume = core.math.sum(quote.bidVolume, toquote.bids)
	}
	if (toquote.asks) {
		toquote.askSize = core.math.sum(quote.askSize, toquote.asks)
		toquote.askVolume = core.math.sum(quote.askVolume, toquote.asks)
	}

	if (toquote.status) {
		toquote.statusTimestamp = Date.now()
	}

	return toquote
}



export function mergeCalcs(quote: Quotes.Calc, toquote?: Quotes.Calc) {
	if (toquote) {

		if (toquote.price) {
			quote.high = core.math.max(quote.high, quote.price, toquote.price)
			quote.low = core.math.min(quote.low, quote.price, toquote.price)
			quote.dayHigh = core.math.max(quote.dayHigh, quote.price, toquote.price)
			quote.dayLow = core.math.min(quote.dayLow, quote.price, toquote.price)
		}

		core.object.merge(quote, toquote)
	} else {
		toquote = quote
	}

	if (toquote.price || toquote.timestamp) {
		let state = hours.getState(hours.rxhours.value, quote.timestamp)

		if (toquote.price) {
			quote.close = quote.price
			quote.change = core.math.sum(quote.price, -quote.startPrice)
			quote.percent = core.calc.percent(quote.price, quote.startPrice)

			if (state.indexOf('PRE') == 0) {
				quote.prePrice = quote.price
				quote.preChange = core.math.sum(quote.price, -quote.startPrice)
				quote.prePercent = core.calc.percent(quote.price, quote.startPrice)
			} else if (state == 'REGULAR') {
				quote.regPrice = quote.price
				quote.regChange = core.math.sum(quote.price, -quote.openPrice)
				quote.regPercent = core.calc.percent(quote.price, quote.openPrice)
			} else if (state.indexOf('POST') == 0) {
				quote.postPrice = quote.price
				quote.postChange = core.math.sum(quote.price, -quote.closePrice)
				quote.postPercent = core.calc.percent(quote.price, quote.closePrice)
			}

			if (quote.sharesOutstanding) {
				quote.marketCap = core.math.round(quote.price * quote.sharesOutstanding)
			}
		}

		if (toquote.timestamp) {
			if (state.indexOf('PRE') == 0) {
				quote.preTimestamp = quote.timestamp
			} else if (state == 'REGULAR') {
				quote.regTimestamp = quote.timestamp
			} else if (state.indexOf('POST') == 0) {
				quote.postTimestamp = quote.timestamp
			}
		}
	}

	if (toquote.bid || toquote.ask) {
		quote.spread = core.math.sum(quote.ask, -quote.bid)
	}
	if (toquote.bidSize || toquote.askSize) {
		quote.spreadFlowSize = core.math.sum(quote.bidSize, -quote.askSize)
		quote.spreadFlowVolume = core.math.sum(quote.bidVolume, -quote.askVolume)
	}

	if (toquote.buySize || toquote.sellSize) {
		quote.dealFlowSize = core.math.sum(quote.buySize, -quote.sellSize)
		quote.dealFlowVolume = core.math.sum(quote.buyVolume, -quote.sellVolume)
	}

	return quote
}


