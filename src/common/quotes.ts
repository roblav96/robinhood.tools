// 

import * as _ from './lodash'
import * as core from './core'
import * as rkeys from './rkeys'
import * as iex from './iex'
import * as webull from './webull'
import * as yahoo from './yahoo'
import * as hours from './hours'



export function applyFull(
	{ symbol, quote, wbticker, wbquote, instrument, yhquote, iexitem }: Partial<Quotes.All>,
	resets = false,
) {

	core.object.merge(quote, {
		symbol,
		tickerId: wbticker.tickerId,
		type: _.startCase(webull.ticker_types[wbticker.type]),
		typeof: wbquote.typeof,
		issueType: iex.issueType(iexitem.issueType),
		timezone: wbquote.utcOffset || wbquote.timeZone,
		sector: iexitem.sector,
		industry: iexitem.industry,
		website: iexitem.website,
		alive: instrument.alive,
		description: iexitem.description,
		listDate: new Date(instrument.list_date).valueOf(),
		mic: core.fallback(instrument.mic, wbticker.exchangeCode),
		acronym: core.fallback(instrument.acronym, wbticker.disExchangeCode),
		exchange: core.fallback(iexitem.exchange, iexitem.primaryExchange, wbticker.exchangeName, yhquote.fullExchangeName, wbticker.disExchangeCode, wbticker.exchangeCode),
		currency: core.fallback(wbticker.currencyCode, wbquote.currency),
		country: core.fallback(instrument.country, wbticker.regionIsoCode, wbquote.countryISOCode, wbquote.regionAlias),
		sharesOutstanding: _.round(core.fallback(wbquote.totalShares, yhquote.sharesOutstanding, iexitem.sharesOutstanding)),
		sharesFloat: _.round(core.fallback(wbquote.outstandingShares, iexitem.float)),
	} as Quotes.Quote)

	let wbname = core.outlier('min', wbticker.tinyName, wbticker.name)
	let yhname = core.outlier('min', yhquote.shortName, yhquote.longName)
	quote.name = core.fallback(yhname, iexitem.companyName, instrument.name, wbname)
	quote.tinyName = core.fallback(instrument.simple_name, yhname, wbname, quote.name)
	quote.fullName = core.fallback(instrument.name, yhname, wbname, quote.name)

	quote.avgVolume10Day = _.round(core.fallback(wbquote.avgVol10D, yhquote.averageDailyVolume10Day))
	quote.avgVolume3Month = _.round(core.fallback(wbquote.avgVol3M, yhquote.averageDailyVolume3Month))
	quote.avgVolume = _.round(core.fallback(wbquote.avgVolume, core.math.sum0(quote.avgVolume10Day, quote.avgVolume3Month) / 2))

	// let toquote = core.clone(quote)
	let toquote = { symbol, stamp: Date.now() } as Quotes.Quote
	mergeCalcs(wbquote, toquote, applyWbQuote(toquote, wbquote))
	core.object.merge(toquote, resetFull(toquote))
	mergeCalcs(wbquote, toquote)
	core.object.repair(quote, toquote)
	// console.log(`toquote ->`, JSON.parse(JSON.stringify(core.sort.keys(toquote))))

	if (resets) {
		core.object.merge(quote, resetFull(quote))
		mergeCalcs(wbquote, quote)
		// console.log(`quote ->`, JSON.parse(JSON.stringify(core.sort.keys(quote))))
	}

	core.object.clean(quote)
	return quote
}



export function resetLive(quote: Quotes.Calc) {
	return {
		size: 0,
		dealSize: 0, dealFlowSize: 0,
		buySize: 0, sellSize: 0,
		bidSize: 0, askSize: 0,
		baFlowSize: 0,
		bidSpread: quote.bid, askSpread: quote.ask,
		open: quote.price, high: quote.price, low: quote.price, close: quote.price,
	} as Quotes.Calc
}

export function resetFull(quote: Quotes.Calc) {
	let toquote = resetLive(quote)
	Object.keys(toquote).forEach(key => {
		let tokey: string
		if (key.includes('size')) tokey = key.replace('size', 'volume');
		if (key.includes('Size')) tokey = key.replace('Size', 'Volume');
		if (tokey && ALL_FULL_KEYS.includes(tokey as any)) {
			toquote[tokey] = 0
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
		symbol: wbdeal.symbol,
		price: wbdeal.deal,
		flag: wbdeal.tradeBsFlag,
		size: wbdeal.volume,
		timestamp: wbdeal.tradeTime,
	} as Quotes.Deal
}

export function applyDeal(quote: Quotes.Calc, deal: Quotes.Deal, toquote = {} as Quotes.Calc) {

	if (deal.timestamp > quote.timestamp) {
		toquote.timestamp = deal.timestamp
		if (quote.price != deal.price) {
			toquote.price = deal.price
		}
	}

	toquote.dealCount = core.math.sum0(quote.dealCount, 1)
	toquote.dealSize = core.math.sum0(quote.dealSize, deal.size)
	toquote.dealVolume = core.math.sum0(quote.dealVolume, deal.size)

	if (deal.flag == 'B') {
		toquote.buySize = core.math.sum0(quote.buySize, deal.size)
		toquote.buyVolume = core.math.sum0(quote.buyVolume, deal.size)
	} else if (deal.flag == 'S') {
		toquote.sellSize = core.math.sum0(quote.sellSize, deal.size)
		toquote.sellVolume = core.math.sum0(quote.sellVolume, deal.size)
	} else {
		toquote.size = core.math.sum0(quote.size, deal.size)
		toquote.volume = core.math.sum0(quote.volume, deal.size)
	}

	return toquote
}



interface KeyMapValue { key: keyof Quotes.Calc, time: boolean, greater: boolean }
export const KEY_MAP = (({
	'faStatus': ({ key: 'status' } as KeyMapValue) as any,
	'status0': ({ key: 'status' } as KeyMapValue) as any,
	'status': ({ key: 'status' } as KeyMapValue) as any,
	// 
	'open': ({ key: 'openPrice' } as KeyMapValue) as any,
	'close': ({ key: 'closePrice' } as KeyMapValue) as any,
	'preClose': ({ key: 'prevClose' } as KeyMapValue) as any,
	// 
	'high': ({ key: 'dayHigh' } as KeyMapValue) as any,
	'low': ({ key: 'dayLow' } as KeyMapValue) as any,
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
	'dealAmount': ({ key: 'dealAmount', greater: true } as KeyMapValue) as any,
	'dealNum': ({ key: 'dealCount', greater: true } as KeyMapValue) as any,
	'volume': ({ key: 'volume', greater: true } as KeyMapValue) as any,
	// '____': ({ key: '____' } as KeyMapValue) as any,
} as Webull.Quote) as any) as Dict<KeyMapValue>
export const KEY_MAP_KEYS = Object.keys(KEY_MAP)

export function applyKeyMap(keymap: KeyMapValue, toquote: any, tokey: string, to: any, from: any) {
	if (keymap && keymap.time) {
		if (to > from) toquote[tokey] = to;
	}
	else if (keymap && keymap.greater) {
		// if (to > from) toquote[tokey] = to;
		if (to < from) {
			if (core.calc.percent(to, from) < -50) toquote[tokey] = to;
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

	if (toquote.timestamp && !toquote.price) {
		if (wbquote.price && toquote.timestamp == wbquote.mktradeTime) {
			toquote.price = wbquote.price
		}
		else if (wbquote.pPrice && toquote.timestamp == wbquote.faTradeTime) {
			toquote.price = wbquote.pPrice
		}
		else if (!quote.price) {
			toquote.price = wbquote.price || wbquote.pPrice
		}
	}

	if (toquote.price) {
		toquote.high = core.math.max(quote.high, quote.price, toquote.price)
		toquote.low = core.math.min(quote.low, quote.price, toquote.price)
		toquote.dayHigh = core.math.max(quote.dayHigh, quote.price, toquote.price) //, toquote.dayHigh)
		toquote.dayLow = core.math.min(quote.dayLow, quote.price, toquote.price) //, toquote.dayLow)
		toquote.yearHigh = core.math.max(quote.yearHigh, quote.price, toquote.price) //, toquote.yearHigh)
		toquote.yearLow = core.math.min(quote.yearLow, quote.price, toquote.price) //, toquote.yearLow)
	}

	if (toquote.volume && !toquote.size) {
		toquote.size = core.math.sum0(quote.size, core.math.sum0(toquote.volume, -quote.volume))
	}

	if (toquote.bid) {
		toquote.bidSpread = core.math.min(quote.bidSpread, quote.bid, toquote.bid)
	}
	if (toquote.ask) {
		toquote.askSpread = core.math.max(quote.askSpread, quote.ask, toquote.ask)
	}
	if (toquote.bids) {
		toquote.bidSize = core.math.sum0(quote.bidSize, toquote.bids)
		toquote.bidVolume = core.math.sum0(quote.bidVolume, toquote.bids)
	}
	if (toquote.asks) {
		toquote.askSize = core.math.sum0(quote.askSize, toquote.asks)
		toquote.askVolume = core.math.sum0(quote.askVolume, toquote.asks)
	}

	if (toquote.status) {
		toquote.statusTimestamp = Date.now()
	}

	return toquote
}



export function mergeCalcs(wbquote: Webull.Quote, quote: Quotes.Calc, toquote?: Quotes.Calc) {
	if (toquote) core.object.merge(quote, toquote);
	else toquote = quote;

	const fa = new Date().getHours() < 12 ? 'pre' : 'post'
	if (toquote.price) {
		if (!quote.startPrice) quote.startPrice = quote.price;

		quote.close = quote.price
		quote.change = core.math.round(core.math.sum(quote.price, -quote.startPrice), 6)
		quote.percent = core.math.round(core.calc.percent(quote.price, quote.startPrice), 6)

		if (fa == 'pre' && wbquote.faTradeTime > wbquote.mktradeTime) {
			quote.prePrice = quote.price
			quote.preChange = core.math.round(core.math.sum(quote.price, -quote.startPrice), 6)
			quote.prePercent = core.math.round(core.calc.percent(quote.price, quote.startPrice), 6)
		}
		if (wbquote.mktradeTime > wbquote.faTradeTime) {
			quote.regPrice = quote.price
			quote.regChange = core.math.round(core.math.sum(quote.price, -quote.openPrice), 6)
			quote.regPercent = core.math.round(core.calc.percent(quote.price, quote.openPrice), 6)
		}
		if (fa == 'post' && wbquote.faTradeTime > wbquote.mktradeTime) {
			quote.postPrice = quote.price
			quote.postChange = core.math.round(core.math.sum(quote.price, -quote.closePrice), 6)
			quote.postPercent = core.math.round(core.calc.percent(quote.price, quote.closePrice), 6)
		}

		if (quote.sharesOutstanding) {
			quote.marketCap = core.math.round(quote.price * quote.sharesOutstanding)
		}
	}
	if (toquote.timestamp) {
		if (fa == 'pre' && wbquote.faTradeTime > wbquote.mktradeTime) {
			quote.preTimestamp = quote.timestamp
		}
		if (wbquote.mktradeTime > wbquote.faTradeTime) {
			quote.regTimestamp = quote.timestamp
		}
		if (fa == 'post' && wbquote.faTradeTime > wbquote.mktradeTime) {
			quote.postTimestamp = quote.timestamp
		}
	}

	if (toquote.bid || toquote.ask) {
		quote.spread = core.math.round(core.math.sum(quote.ask, -quote.bid), 6)
		quote.baSpread = core.math.round(core.math.sum(quote.askSpread, -quote.bidSpread), 6)
	}
	if (toquote.bidSize || toquote.askSize) {
		quote.baFlowSize = core.math.sum(quote.bidSize, -quote.askSize)
		quote.baFlowVolume = core.math.sum(quote.bidVolume, -quote.askVolume)
	}

	if (toquote.buySize || toquote.sellSize) {
		quote.dealFlowSize = core.math.sum(quote.buySize, -quote.sellSize)
		quote.dealFlowVolume = core.math.sum(quote.buyVolume, -quote.sellVolume)
	}

	return quote
}





export const ALL_RKEYS = {
	'quote': rkeys.QUOTES,
	'wbticker': rkeys.WB.TICKERS,
	'wbquote': rkeys.WB.QUOTES,
	'instrument': rkeys.RH.INSTRUMENTS,
	'yhquote': rkeys.YH.QUOTES,
	'iexitem': rkeys.IEX.ITEMS,
}
declare global { namespace Quotes { type AllKeys = keyof typeof ALL_RKEYS } }

export function convert<T>(quote: T, qkeys: string[]) {
	Object.keys(quote).forEach(k => {
		if (qkeys.indexOf(k) == -1) delete quote[k];
	})
}
export function getConverted<T>(quote: T, qkeys: string[]) {
	let toquote = {} as T
	qkeys.forEach(k => {
		let v = quote[k]
		if (v != null) toquote[k] = v;
	})
	return toquote
}

export function isSymbol(symbol: string) {
	return !Array.isArray(symbol.match(/[^a-zA-Z0-9-.]/))
}



let string = ''
let number = 0
let boolean = false

declare global { namespace Quotes { type ITiny = typeof TINY; interface Tiny extends ITiny { } } }
const TINY = {
	symbol: string,
	price: number,
	timestamp: number,
}
export const TINY_KEYS = Object.keys(TINY).sort() as (keyof typeof TINY)[]
export const ALL_TINY_KEYS = TINY_KEYS.sort() as (keyof Quotes.Tiny)[]
core.nullify(TINY)



declare global { namespace Quotes { type ILive = typeof LIVE; interface Live extends ILive, Tiny { } } }
const LIVE = {
	stamp: number,
	// 
	status: string,
	statusTimestamp: number,
	// 
	liveCount: number,
	liveStamp: number,
	// 
	open: number,
	high: number,
	low: number,
	close: number,
	// 
	dayHigh: number,
	dayLow: number,
	yearHigh: number,
	yearLow: number,
	// 
	bid: number,
	ask: number,
	bids: number,
	asks: number,
	// 
	bidSpread: number,
	askSpread: number,
	bidSize: number,
	askSize: number,
	bidVolume: number,
	askVolume: number,
	// 
	size: number,
	volume: number,
	// 
	dealAmount: number,
	dealCount: number,
	dealSize: number,
	dealVolume: number,
	// 
	buySize: number,
	sellSize: number,
	buyVolume: number,
	sellVolume: number,
	// 
	turnoverRate: number,
	vibrateRatio: number,
	yield: number,
}
export const LIVE_KEYS = Object.keys(LIVE).sort() as (keyof typeof LIVE)[]
export const ALL_LIVE_KEYS = LIVE_KEYS.concat(ALL_TINY_KEYS as any).sort() as (keyof Quotes.Live)[]
core.nullify(LIVE)



declare global { namespace Quotes { type ICalc = typeof CALC; interface Calc extends ICalc, Live { } } }
const CALC = {
	change: number,
	percent: number,
	startPrice: number,
	openPrice: number,
	closePrice: number,
	prevClose: number,
	// 
	spread: number,
	baSpread: number,
	baFlowSize: number,
	baFlowVolume: number,
	// 
	dealFlowVolume: number,
	dealFlowSize: number,
	// 
	avgVolume: number,
	avgVolume10Day: number,
	avgVolume3Month: number,
	sharesOutstanding: number,
	sharesFloat: number,
	marketCap: number,
	// 
	quoteMaker: string,
	quoteMakerAddress: string,
	// 
	prePrice: number,
	preChange: number,
	prePercent: number,
	preTimestamp: number,
	// 
	regPrice: number,
	regChange: number,
	regPercent: number,
	regTimestamp: number,
	// 
	postPrice: number,
	postChange: number,
	postPercent: number,
	postTimestamp: number,
}
export const CALC_KEYS = Object.keys(CALC).sort() as (keyof typeof CALC)[]
export const ALL_CALC_KEYS = CALC_KEYS.concat(ALL_LIVE_KEYS as any).sort() as (keyof Quotes.Calc)[]
core.nullify(CALC)



declare global { namespace Quotes { type IFull = typeof FULL; interface Full extends IFull, Calc { } } }
const FULL = {
	tickerId: number,
	type: string,
	typeof: string as TypeOfSymbols,
	alive: boolean,
	name: string,
	tinyName: string,
	fullName: string,
	description: string,
	mic: string,
	acronym: string,
	exchange: string,
	country: string,
	timezone: string,
	issueType: string,
	currency: string,
	sector: string,
	industry: string,
	website: string,
	listDate: number,
}
export const FULL_KEYS = Object.keys(FULL).sort() as (keyof typeof FULL)[]
export const ALL_FULL_KEYS = FULL_KEYS.concat(ALL_CALC_KEYS as any).sort() as (keyof Quotes.Full)[]
core.nullify(FULL)



declare global { namespace Quotes { type IDeal = typeof DEAL; interface Deal extends IDeal { } } }
const DEAL = {
	symbol: string,
	price: number,
	size: number,
	flag: string as 'N' | 'B' | 'S',
	timestamp: number,
}
export const DEAL_KEYS = Object.keys(DEAL).sort() as (keyof Quotes.Deal)[]
core.nullify(DEAL)





declare global {
	namespace Quotes {
		interface Quote extends Quotes.Full { }
		interface All {
			symbol: string
			quote: Quote
			wbticker: Webull.Ticker
			wbquote: Webull.Quote
			instrument: Robinhood.Instrument
			yhquote: Yahoo.Quote
			iexitem: Iex.Item
			// deals: Deal[]
		}
	}
}





// declare global { namespace Quotes { type ISmall = typeof SMALL; interface Small extends ISmall, Tiny { } } }
// const SMALL = {

// }
// export const SMALL_KEYS = Object.keys(SMALL).concat(TINY_KEYS).sort() as (keyof Quotes.Small)[]
// core.nullify(SMALL)


