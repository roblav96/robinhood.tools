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



export async function getAlls(symbols: string[], allkeys = Object.keys(quotes.ALL_KEYS) as Quotes.AllKeys[]) {
	let resolved = await redis.main.coms(_.flatten(symbols.map(v => {
		return allkeys.map(k => ['hgetall', `${quotes.ALL_KEYS[k]}:${v}`])
	})))
	resolved.forEach(core.fix)
	let ii = 0
	return symbols.map(symbol => {
		let all = { symbol } as Quotes.All
		allkeys.forEach(k => all[k] = resolved[ii++])
		return all
	})
}

export async function syncAllQuotes(resets = false) {
	let symbols = await utils.getAllSymbols()
	let chunks = core.array.chunks(symbols, _.ceil(symbols.length / 256))
	await pAll(chunks.map((chunk, i) => async () => {
		if (process.env.DEVELOPMENT) console.log('syncAllQuotes ->', `${_.round((i / chunks.length) * 100)}%`);
		let alls = await getAlls(chunk)
		await redis.main.coms(alls.map(all => {
			let rkey = `${rkeys.QUOTES}:${all.symbol}`
			return ['hmset', rkey, initquote(all, resets) as any]
		}))
	}), { concurrency: 1 })
}



export function initquote(
	{ symbol, quote, wbticker, wbquote, instrument, yhquote, iexitem }: Quotes.All,
	resets = false,
) {

	core.object.merge(quote, {
		symbol,
		tickerId: wbticker.tickerId,
		timezone: wbquote.utcOffset,
		currency: wbquote.currency,
		sector: iexitem.sector,
		industry: iexitem.industry,
		website: iexitem.website,
		alive: instrument.alive,
		mic: instrument.mic,
		acronym: instrument.acronym,
		issueType: iex.ISSUE_TYPES[iexitem.issueType],
		listDate: new Date(instrument.list_date).valueOf(),
		country: core.fallback(instrument.country, wbquote.countryISOCode, wbquote.regionAlias, wbticker.regionIsoCode),
		exchange: core.fallback(iexitem.exchange, iexitem.primaryExchange, wbticker.exchangeCode, wbticker.disExchangeCode),
		sharesOutstanding: _.round(core.fallback(wbquote.totalShares, yhquote.sharesOutstanding, iexitem.sharesOutstanding)),
		sharesFloat: _.round(core.fallback(wbquote.outstandingShares, iexitem.float)),
	} as Quotes.Quote)

	quote.name = core.fallback(iexitem.companyName, instrument.simple_name, yhquote.shortName, wbticker.tinyName, wbticker.name)
	quote.tinyName = core.fallback(instrument.simple_name, yhquote.shortName, quote.name)
	quote.fullName = core.fallback(instrument.name, yhquote.longName, wbticker.name)
	if (quote.fullName == quote.name) delete quote.fullName;

	quote.avgVolume10Day = _.round(core.fallback(wbquote.avgVol10D, yhquote.averageDailyVolume10Day))
	quote.avgVolume3Month = _.round(core.fallback(wbquote.avgVol3M, yhquote.averageDailyVolume3Month))
	quote.avgVolume = _.round(core.fallback(wbquote.avgVolume, _.round(quote.avgVolume10Day, quote.avgVolume3Month)))

	core.object.repair(quote, applywbquote(quote, wbquote))
	core.object.repair(quote, applybidask(quote, wbquote))

	let reset = resetquote(quote, true)
	resets ? core.object.merge(quote, reset) : core.object.repair(quote, reset)

	applycalcs(quote)
	core.object.clean(quote)

	return quote

}



export function resetquote(quote: Quotes.Quote, resets = false) {
	let reset = {
		size: 0,
		bidSize: 0, askSize: 0,
		buySize: 0, sellSize: 0,
		// dealSize: 0, dealFlowSize: 0,
		open: quote.price, high: quote.price, low: quote.price, close: quote.price,
		// bidSpread: quote.bidPrice, askSpread: quote.askPrice,
	} as Quotes.Quote
	if (resets) {
		reset.volume = 0
		// Object.keys(reset).forEach(key => {
		// 	if (key.indexOf('Size') == -1) return;
		// 	reset[key.replace('Size', 'Volume')] = 0
		// })
		core.object.merge(reset, {
			startPrice: quote.price,
			dayHigh: quote.price, dayLow: quote.price,
			liveCount: 0, dealCount: 0,
		} as Quotes.Quote)
	}
	return reset
}



export function todeal(wbdeal: Webull.Deal) {
	return {
		price: wbdeal.deal,
		side: wbdeal.tradeBsFlag,
		size: wbdeal.volume,
		symbol: wbdeal.symbol,
		timestamp: wbdeal.tradeTime,
	} as Quotes.Deal
}

export function applydeal(quote: Quotes.Quote, deal: Quotes.Deal, toquote = {} as Quotes.Quote) {

	if (deal.timestamp > quote.timestamp) {
		toquote.timestamp = deal.timestamp
		if (deal.price != quote.price) {
			toquote.price = deal.price
		}
	}

	toquote.dealCount = quote.dealCount + 1
	toquote.dealSize = quote.dealSize + deal.size
	toquote.dealVolume = quote.dealVolume + deal.size

	if (deal.side == 'B') {
		toquote.buySize = quote.buySize + deal.size
		toquote.buyVolume = quote.buyVolume + deal.size
	} else if (deal.side == 'S') {
		toquote.sellSize = quote.sellSize + deal.size
		toquote.sellVolume = quote.sellVolume + deal.size
	} else {
		toquote.volume = quote.volume + deal.size
	}

	return toquote
}



export function applybidask(quote: Quotes.Quote, wbquote: Webull.Quote, toquote = {} as Quotes.Quote) {

	let keymap = [
		{ key: 'bid', fn: 'min' },
		{ key: 'ask', fn: 'max' },
	]
	keymap.forEach(({ key, fn }) => {
		let kprice = `${key}Price`
		let kspread = `${key}Spread`
		if (wbquote[key] && wbquote[key] > 0) {
			toquote[kspread] = _[fn]([quote[kspread], quote[key], wbquote[key]])
			toquote[kprice] = wbquote[key]
		}
		let ksize = `${key}Size`
		let klot = `${key}Lot`
		let kvolume = `${key}Volume`
		if (wbquote[ksize]) {
			toquote[klot] = wbquote[ksize]
			toquote[ksize] = quote[ksize] + wbquote[ksize]
			toquote[kvolume] = quote[kvolume] + wbquote[ksize]
		}
	})

	return toquote
}



interface KeyMapValue {
	key: keyof Quotes.Quote
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
	'dealAmount': ({ greater: true } as KeyMapValue) as any,
	// '____': ({ key: '____' } as KeyMapValue) as any,
} as Webull.Quote) as any) as Dict<KeyMapValue>



export function applywbquote(quote: Quotes.Quote, wbquote: Webull.Quote, toquote = {} as Quotes.Quote) {

	Object.keys(wbquote).forEach(k => {
		let wbvalue = wbquote[k]
		let keymap = KEY_MAP[k]
		if (!keymap || !keymap.key) return;

		let qkey = keymap.key
		let qvalue = quote[qkey]
		if (qvalue == null) { qvalue = wbvalue; quote[qkey] = wbvalue; toquote[qkey] = wbvalue }

		if (keymap.time || keymap.greater) {
			if (wbvalue > qvalue) {
				toquote[qkey] = wbvalue
			}
		}
		else if (wbvalue != qvalue) {
			toquote[qkey] = wbvalue
		}

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



export function applycalcs(quote: Quotes.Quote, toquote?: Quotes.Quote) {
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

		toquote.close = quote.price

		if (quote.sharesOutstanding) {
			toquote.marketCap = _.round(quote.price * quote.sharesOutstanding)
		}
	}

	if (toquote.askPrice || toquote.bidPrice) {
		toquote.spread = quote.askPrice - quote.bidPrice
	}

	return toquote
}





// export const mockquote = {
// 	listDate: 916963200000,
// 	country: 'US',
// 	close: 246.75,
// 	price: 246.73,
// 	turnoverRate: 0.0191,
// 	openPrice: 240.28,
// 	volume: 11077801,
// 	sharesFloat: 580151962,
// 	askSize: 25,
// 	symbol: 'NVDA',
// 	exchange: 'Nasdaq Global Select',
// 	bidVolume: 0,
// 	high: 247.5,
// 	yearLow: 135.71,
// 	dayHigh: 247.59,
// 	industry: 'Semiconductors',
// 	askVolume: 0,
// 	startPrice: 247.5,
// 	currency: 'USD',
// 	alive: true,
// 	sharesOutstanding: 606000000,
// 	sellVolume: 400,
// 	statusTimestamp: 1527159036999,
// 	change: -0.75,
// 	mic: 'XNAS',
// 	size: 0,
// 	yield: 0.0023,
// 	dayLow: 240.25,
// 	fullName: 'NVIDIA Corporation Common Stock',
// 	closePrice: 247.54,
// 	buyVolume: 924,
// 	name: 'NVIDIA Corporation',
// 	askPrice: 247.7,
// 	percent: -0.30303030303030304,
// 	tickerId: 913257561,
// 	website: 'http://www.nvidia.com',
// 	issueType: 'cs',
// 	dealSize: 5199,
// 	status: 'POST_TRADE',
// 	avgVolume3Month: 14787943,
// 	avgVolume: 17520461,
// 	sector: 'Technology',
// 	avgVolume10Day: 14491447,
// 	prevClose: 242.55,
// 	low: 247.5,
// 	vibrateRatio: 0.0303,
// 	acronym: 'NASDAQ',
// 	yearHigh: 260.5,
// 	bidSize: 12,
// 	buySize: 924,
// 	dealVolume: 5199,
// 	open: 247.5,
// 	bidPrice: 247.36,
// 	count: 0,
// 	sellSize: 400,
// 	timezone: 'America/New_York',
// 	spread: 0.339999999999975,
// 	deals: 111847,
// 	marketCap: 149530500000,
// 	timestamp: 1527170047000
// } as Quotes.Quote

// import * as benchmark from '../../common/benchmark'
// benchmark.simple('object', [
// 	function noop() { },
// 	function keys() { Object.keys(mockquote) },
// 	function assign() { Object.assign(mockquote, mockquote) },
// ])


