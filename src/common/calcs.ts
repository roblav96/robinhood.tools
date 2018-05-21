// 

import * as rkeys from './rkeys'



declare global {

	namespace Calc {

		interface Tiny {
			symbol: string
			price: number
			eodPrice: number
			openPrice: number
			closePrice: number
			prevClose: number
			updated: number
		}

		interface Full extends Tiny {
			tickerId: number
			status: string
			// 
			name: string
			typeof: keyof typeof rkeys.SYMBOLS
			exchange: string
			mic: string
			acronym: string
			country: string
			// 
			yearHigh: number
			yearLow: number
			dayHigh: number
			dayLow: number
			// 
			bidPrice: number
			askPrice: number
			bidSize: number
			askSize: number
			// 
			deals: number
			buyVolume: number
			sellVolume: number
			// 
			avgVolume: number
			avgVolume10Day: number
			avgVolume3Month: number
			volume: number
			// 
			sharesOutstanding: number
			sharesFloat: number
			marketCap: number
			// 
		}

		interface Deal {
			symbol: string
			price: number
			size: number
			side: 'N' | 'B' | 'S'
			timestamp: number
		}

	}

}


