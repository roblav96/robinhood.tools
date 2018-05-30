// 

import * as core from './core'
import * as rkeys from './rkeys'



export const ALL_KEYS = {
	'quote': rkeys.QUOTES,
	'wbticker': rkeys.WB.TICKERS,
	'wbquote': rkeys.WB.QUOTES,
	'instrument': rkeys.RH.INSTRUMENTS,
	'yhquote': rkeys.YH.QUOTES,
	'iexitem': rkeys.IEX.ITEMS,
}
declare global { namespace Quotes { type AllKeys = keyof typeof ALL_KEYS } }



export function conform<T>({
	quote, qkeys, mutate,
}: Partial<{ quote: Quotes.Quote, qkeys: string[], mutate: boolean }>): T {
	if (!mutate) {
		return qkeys.reduce((toquote, qkey, index) => {
			if (quote[qkey] != null) toquote[qkey] = quote[qkey];
			return toquote
		}, {} as T)
	}
	Object.keys(quote).forEach(k => {
		if (qkeys.indexOf(k) == -1) delete quote[k];
	})
	return quote as any
}



declare global { namespace Quotes { type ITiny = typeof TINY; interface Tiny extends ITiny { } } }
const TINY = {
	symbol: '',
	price: 0,
	size: 0,
	timestamp: 0,
}
export const TINY_KEYS = Object.keys(TINY).sort() as (keyof typeof TINY)[]
export const TINY_KEYS_ALL = TINY_KEYS.sort() as (keyof Quotes.Tiny)[]
core.nullify(TINY)



declare global { namespace Quotes { type ILive = typeof LIVE; interface Live extends ILive, Tiny { } } }
const LIVE = {
	status: '',
	statusTimestamp: 0,
	// 
	liveStamp: 0,
	liveCount: 0,
	// 
	open: 0,
	high: 0,
	low: 0,
	close: 0,
	// 
	dayHigh: 0,
	dayLow: 0,
	// 
	bidPrice: 0,
	askPrice: 0,
	bidSize: 0,
	askSize: 0,
	// 
	// spread: 0,
	// bidSpread: 0,
	// askSpread: 0,
	// bidSizeAccum: 0,
	// askSizeAccum: 0,
	// bidSize: 0,
	// askSize: 0,
	// bidVolume: 0,
	// askVolume: 0,
	// 
	volume: 0,
	dealCount: 0,
	dealSize: 0,
	dealVolume: 0,
	buySize: 0,
	sellSize: 0,
	buyVolume: 0,
	sellVolume: 0,
	// 
	// dealFlowVolume: 0,
	// dealFlowSize: 0,
	// 
	turnoverRate: 0,
	vibrateRatio: 0,
	yield: 0,
}
export const LIVE_KEYS = Object.keys(LIVE).sort() as (keyof typeof LIVE)[]
export const LIVE_KEYS_ALL = LIVE_KEYS.concat(TINY_KEYS_ALL as any).sort() as (keyof Quotes.Live)[]
core.nullify(LIVE)



declare global { namespace Quotes { type ICalc = typeof CALC; interface Calc extends ICalc, Live { } } }
const CALC = {
	change: 0,
	percent: 0,
	startPrice: 0,
	openPrice: 0,
	closePrice: 0,
	prevClose: 0,
	yearHigh: 0,
	yearLow: 0,
	// 
	avgVolume: 0,
	avgVolume10Day: 0,
	avgVolume3Month: 0,
	sharesOutstanding: 0,
	sharesFloat: 0,
	marketCap: 0,
	// 
	typeof: '' as TypeofSymbols,
	quoteMaker: '',
	quoteMakerAddress: '',
	// 
	prePrice: 0,
	preChange: 0,
	prePercent: 0,
	preTimestamp: 0,
	// 
	regPrice: 0,
	regChange: 0,
	regPercent: 0,
	regTimestamp: 0,
	// 
	postPrice: 0,
	postChange: 0,
	postPercent: 0,
	postTimestamp: 0,
}
export const CALC_KEYS = Object.keys(CALC).sort() as (keyof typeof CALC)[]
export const CALC_KEYS_ALL = CALC_KEYS.concat(LIVE_KEYS_ALL as any).sort() as (keyof Quotes.Calc)[]
core.nullify(CALC)



declare global { namespace Quotes { type IFull = typeof FULL; interface Full extends IFull, Calc { } } }
const FULL = {
	tickerId: 0,
	alive: false,
	name: '',
	tinyName: '',
	fullName: '',
	mic: '',
	acronym: '',
	exchange: '',
	country: '',
	timezone: '',
	issueType: '',
	currency: '',
	sector: '',
	industry: '',
	website: '',
	listDate: 0,
}
export const FULL_KEYS = Object.keys(FULL).sort() as (keyof typeof FULL)[]
export const FULL_KEYS_ALL = FULL_KEYS.concat(CALC_KEYS_ALL as any).sort() as (keyof Quotes.Full)[]
core.nullify(FULL)



declare global { namespace Quotes { type IDeal = typeof DEAL; interface Deal extends IDeal { } } }
const DEAL = {
	symbol: '',
	price: 0,
	size: 0,
	side: '' as 'N' | 'B' | 'S',
	timestamp: 0,
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


