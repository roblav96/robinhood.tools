// 

import * as rkeys from './rkeys'



declare global { namespace Quotes { type IBasic = typeof BASIC; interface Basic extends IBasic { } } }
export const BASIC = {
	symbol: '',
	tickerId: 0,
	name: '',
	typeof: '' as keyof typeof rkeys.SYMBOLS,
	price: 0,
	change: 0,
	percent: 0,
	eodPrice: 0,
	openPrice: 0,
	closePrice: 0,
	prevClose: 0,
	volume: 0,
	size: 0,
	timestamp: 0,
}
Object.keys(BASIC).forEach(k => BASIC[k] = undefined)



declare global { namespace Quotes { type ILive = typeof LIVE; interface Live extends ILive, Basic { } } }
export const LIVE = {
	status: '',
	statusUpdatedAt: 0,
	alive: true,
	// 
	open: 0,
	high: 0,
	low: 0,
	close: 0,
	// 
	yearHigh: 0,
	yearLow: 0,
	dayHigh: 0,
	dayLow: 0,
	// 
	spread: 0,
	bidPrice: 0,
	askPrice: 0,
	bidSize: 0,
	askSize: 0,
	bidVolume: 0,
	askVolume: 0,
	// 
	count: 0,
	deals: 0,
	dealVolume: 0,
	dealVolumeFlow: 0,
	dealSize: 0,
	dealSizeFlow: 0,
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
Object.keys(LIVE).forEach(k => LIVE[k] = undefined)



declare global { namespace Quotes { type ICalc = typeof CALC; interface Calc extends ICalc, Live { } } }
export const CALC = {

}
Object.keys(CALC).forEach(k => CALC[k] = undefined)



declare global { namespace Quotes { type IFull = typeof FULL; interface Full extends IFull, Calc { } } }
export const FULL = {
	fullName: '',
	mic: '',
	acronym: '',
	exchange: '',
	country: '',
	currency: '',
	listDate: 0,
	// 
	avgVolume: 0,
	avgVolume10Day: 0,
	avgVolume3Month: 0,
	sharesOutstanding: 0,
	sharesFloat: 0,
}
Object.keys(FULL).forEach(k => FULL[k] = undefined)



declare global { namespace Quotes { type IDeal = typeof DEAL; interface Deal extends IDeal { } } }
export const DEAL = {
	symbol: '',
	price: 0,
	size: 0,
	side: '' as 'N' | 'B' | 'S',
	timestamp: 0,
}
Object.keys(DEAL).forEach(k => DEAL[k] = undefined)





declare global {
	namespace Quotes {
		interface Quote extends Quotes.Full { }
	}
}


