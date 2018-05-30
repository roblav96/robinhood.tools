// 

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





declare global { namespace Quotes { type ITiny = typeof TINY; interface Tiny extends ITiny { } } }
export const TINY = {
	symbol: '',
	price: 0,
	timestamp: 0,
}
export const TINY_KEYS = Object.keys(TINY)
TINY_KEYS.forEach(k => TINY[k] = undefined)



declare global { namespace Quotes { type ISmall = typeof SMALL; interface Small extends ISmall, Tiny { } } }
export const SMALL = {
	typeof: '' as SymbolsTypes,
	name: '',
	change: 0,
	percent: 0,
	startPrice: 0,
	endPrice: 0,
	openPrice: 0,
	closePrice: 0,
	prevClose: 0,
	size: 0,
	volume: 0,
}
export const SMALL_KEYS = Object.keys(SMALL)
SMALL_KEYS.forEach(k => SMALL[k] = undefined)



declare global { namespace Quotes { type ILive = typeof LIVE; interface Live extends ILive, Small { } } }
export const LIVE = {
	status: '',
	statusTimestamp: 0,
	alive: false,
	// 
	open: 0,
	high: 0,
	low: 0,
	close: 0,
	// 
	bidPrice: 0,
	askPrice: 0,
	spread: 0,
	bidSpread: 0,
	askSpread: 0,
	bidLot: 0,
	askLot: 0,
	bidSize: 0,
	askSize: 0,
	bidVolume: 0,
	askVolume: 0,
	// 
	count: 0,
	deals: 0,
	dealVolume: 0,
	dealFlowVolume: 0,
	dealSize: 0,
	dealFlowSize: 0,
	// 
	buyVolume: 0,
	sellVolume: 0,
	buySize: 0,
	sellSize: 0,
	// 
	marketCap: 0,
	turnoverRate: 0,
	vibrateRatio: 0,
	yield: 0,
	// 
	quoteMaker: '',
	quoteMakerAddress: '',
}
export const LIVE_KEYS = Object.keys(LIVE)
LIVE_KEYS.forEach(k => LIVE[k] = undefined)



declare global { namespace Quotes { type ICalc = typeof CALC; interface Calc extends ICalc, Live { } } }
export const CALC = {
	yearHigh: 0,
	yearLow: 0,
	dayHigh: 0,
	dayLow: 0,
	// 
	prePrice: 0,
	preChange: 0,
	prePercent: 0,
	preTimestamp: 0,
	regPrice: 0,
	regChange: 0,
	regPercent: 0,
	regTimestamp: 0,
	postPrice: 0,
	postChange: 0,
	postPercent: 0,
	postTimestamp: 0,
}
export const CALC_KEYS = Object.keys(CALC)
CALC_KEYS.forEach(k => CALC[k] = undefined)



declare global { namespace Quotes { type IFull = typeof FULL; interface Full extends IFull, Calc { } } }
export const FULL = {
	tickerId: 0,
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
	description: '',
	listDate: 0,
	// 
	avgVolume: 0,
	avgVolume10Day: 0,
	avgVolume3Month: 0,
	sharesOutstanding: 0,
	sharesFloat: 0,
}
export const FULL_KEYS = Object.keys(FULL)
FULL_KEYS.forEach(k => FULL[k] = undefined)



declare global { namespace Quotes { type IDeal = typeof DEAL; interface Deal extends IDeal { } } }
export const DEAL = {
	symbol: '',
	price: 0,
	size: 0,
	side: '' as 'N' | 'B' | 'S',
	timestamp: 0,
}
export const DEAL_KEYS = Object.keys(DEAL)
DEAL_KEYS.forEach(k => DEAL[k] = undefined)





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


