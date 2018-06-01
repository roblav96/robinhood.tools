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
			return ['hmset', rkey, initquote(all, resets) as any]
		}))
	}), { concurrency: 1 })
	if (process.env.DEVELOPMENT) console.info('syncAllQuotes done ->');
}



export function initquote(
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

	core.object.repair(quote, applywbquote(quote, wbquote))
	core.object.repair(quote, applybidask(quote, wbquote))

	let reset = resetquote(quote)
	resets ? core.object.merge(quote, reset) : core.object.repair(quote, reset)

	applylives(quote, quote, quote)
	applycalcs(quote)
	core.object.clean(quote)

	return quote

}



export function resetlive(quote: Quotes.Calc) {
	return {
		size: 0,
		dealSize: 0, dealFlowSize: 0,
		buySize: 0, sellSize: 0,
		bidSize: 0, askSize: 0,
		open: quote.price, high: quote.price, low: quote.price, close: quote.price,
		bidSpread: quote.bid, askSpread: quote.ask,
	} as Quotes.Calc
}

export function resetquote(quote: Quotes.Calc) {
	let toquote = resetlive(quote)
	Object.keys(toquote).forEach(key => {
		if (key.indexOf('size') >= 0) {
			return toquote[key.replace('size', 'volume')] = 0
		}
		if (key.indexOf('Size') >= 0) {
			return toquote[key.replace('Size', 'Volume')] = 0
		}
	})
	core.object.merge(toquote, {
		liveCount: 0, dealCount: 0,
		startPrice: quote.price,
		dayHigh: quote.price, dayLow: quote.price,
	} as Quotes.Calc)
	return toquote
}



export function todeal(wbdeal: Webull.Deal) {
	return {
		price: wbdeal.deal,
		flag: wbdeal.tradeBsFlag,
		size: wbdeal.volume,
		symbol: wbdeal.symbol,
		timestamp: wbdeal.tradeTime,
	} as Quotes.Deal
}

export function applydeal(quote: Quotes.Live, deal: Quotes.Deal, toquote = {} as Quotes.Live) {

	if (deal.timestamp > quote.timestamp) {
		toquote.timestamp = deal.timestamp
		if (deal.price != quote.price) {
			toquote.price = deal.price
		}
	}

	toquote.dealCount = quote.dealCount + 1
	toquote.dealSize = quote.dealSize + deal.size
	toquote.dealVolume = quote.dealVolume + deal.size

	let flow = 0
	if (deal.flag == 'B') {
		toquote.buySize = quote.buySize + deal.size
		toquote.buyVolume = quote.buyVolume + deal.size
		flow = deal.size
	} else if (deal.flag == 'S') {
		toquote.sellSize = quote.sellSize + deal.size
		toquote.sellVolume = quote.sellVolume + deal.size
		flow = -deal.size
	} else {
		toquote.volume = quote.volume + deal.size
	}
	if (flow) {
		toquote.dealFlowSize = quote.dealFlowSize + flow
		toquote.dealFlowVolume = quote.dealFlowVolume + flow
	}

	return toquote
}



export function applybidask(quote: Quotes.Calc, wbquote: Webull.Quote, toquote = {} as Quotes.Calc) {
	let keymap = [
		{ key: 'bid', fn: 'min', infinity: Infinity },
		{ key: 'ask', fn: 'max', infinity: -Infinity },
	]
	keymap.forEach(({ key, fn, infinity }) => {
		if (Number.isFinite(wbquote[key])) {
			toquote[key] = wbquote[key]
			let kspread = `${key}Spread`
			toquote[kspread] = Math[fn](quote[kspread] || infinity, quote[key] || infinity, wbquote[key] || infinity)
		}
		let ksize = `${key}Size`
		if (Number.isFinite(wbquote[ksize])) {
			let ks = `${key}s`
			toquote[ks] = wbquote[ksize]
			toquote[ksize] = (quote[ksize] || 0) + wbquote[ksize]
			let kvolume = `${key}Volume`
			toquote[kvolume] = (quote[kvolume] || 0) + wbquote[ksize]
		}
	})

	return toquote
}



interface KeyMapValue {
	key: keyof Quotes.Calc
	time: boolean, greater: boolean,
}
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
	// 'bid': ({ key: 'bidPrice' } as KeyMapValue) as any,
	// 'ask': ({ key: 'askPrice' } as KeyMapValue) as any,
	// 'bidSize': ({ key: 'bidLot' } as KeyMapValue) as any,
	// 'askSize': ({ key: 'askLot' } as KeyMapValue) as any,
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



export function applykeymap(keymap: KeyMapValue, toquote: any, tokey: string, to: any, from: any) {
	if (keymap && (keymap.time || keymap.greater)) {
		if (keymap.time) {
			if (to > from) toquote[tokey] = to;
		}
		else if (keymap.greater) {
			if (to < from) {
				if (core.calc.percent(to, from) < -10) toquote[tokey] = to;
			}
			else if (to > from) toquote[tokey] = to;
		}
	}
	else if (to != from) {
		toquote[tokey] = to
	}
}



export function applywbquote(quote: Quotes.Live, wbquote: Webull.Quote, toquote = {} as Quotes.Live) {

	Object.keys(wbquote).forEach(key => {
		let wbvalue = wbquote[key]
		let keymap = KEY_MAP[key]
		if (!keymap || !keymap.key) return;

		let qkey = keymap.key
		let qvalue = quote[qkey]
		if (qvalue == null) { qvalue = wbvalue; quote[qkey] = wbvalue; toquote[qkey] = wbvalue }

		applykeymap(keymap, toquote, qkey, wbvalue, qvalue)

		// if (keymap.time || keymap.greater) {
		// 	if (wbvalue > qvalue) {
		// 		toquote[qkey] = wbvalue
		// 	}
		// }
		// else if (wbvalue != qvalue) {
		// 	toquote[qkey] = wbvalue
		// }

	})

	if (toquote.status) {
		toquote.statusTimestamp = Date.now()
	}

	if (toquote.timestamp) {
		if (wbquote.mktradeTime == toquote.timestamp && wbquote.price && wbquote.price != quote.price) {
			toquote.price = wbquote.price
		}
		if (wbquote.faTradeTime == toquote.timestamp && wbquote.pPrice && wbquote.pPrice != quote.price) {
			toquote.price = wbquote.pPrice
		}
	}

	return toquote
}



export function applylives(quote: Quotes.Calc, lquote: Quotes.Live, toquote: Quotes.Live) {
	if (toquote.price) {
		toquote.high = Math.max(quote.high || -Infinity, toquote.price)
		toquote.low = Math.min(quote.low || Infinity, toquote.price)
		toquote.close = quote.price
		toquote.dayHigh = Math.max(quote.dayHigh || -Infinity, toquote.price)
		toquote.dayLow = Math.min(quote.dayLow || Infinity, toquote.price)
	}
	if (toquote.volume) {
		toquote.size = toquote.volume - lquote.volume
	}
	return toquote
}



export function applycalcs(quote: Quotes.Calc, toquote?: Quotes.Calc) {
	if (!toquote) { toquote = quote } else { core.object.merge(quote, toquote) };

	if (toquote.price) {
		toquote.change = quote.price - quote.startPrice
		toquote.percent = core.calc.percent(quote.price, quote.startPrice)

		let state = hours.getState(hours.rxhours.value, quote.timestamp)
		if (state.indexOf('PRE') == 0) {
			toquote.prePrice = quote.price
			toquote.preChange = quote.price - quote.startPrice
			toquote.prePercent = core.calc.percent(quote.price, quote.startPrice)
			toquote.preTimestamp = quote.timestamp
		} else if (state == 'REGULAR') {
			toquote.regPrice = quote.price
			toquote.regChange = quote.price - quote.openPrice
			toquote.regPercent = core.calc.percent(quote.price, quote.openPrice)
			toquote.regTimestamp = quote.timestamp
		} else if (state.indexOf('POST') == 0) {
			toquote.postPrice = quote.price
			toquote.postChange = quote.price - quote.closePrice
			toquote.postPercent = core.calc.percent(quote.price, quote.closePrice)
			toquote.postTimestamp = quote.timestamp
		}

		if (quote.sharesOutstanding) {
			toquote.marketCap = _.round(quote.price * quote.sharesOutstanding)
		}
	}

	return toquote
}


