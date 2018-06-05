// 

import * as core from './core'
import * as rkeys from './rkeys'



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



const string = ''
const number = 0
const boolean = false

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
	yearHigh: number,
	yearLow: number,
	// 
	bid: number,
	ask: number,
	bids: number,
	asks: number,
	spread: number,
	spreadFlowSize: number,
	spreadFlowVolume: number,
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


