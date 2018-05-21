// 

import * as rkeys from './rkeys'



declare global {

	namespace Calc {

		interface TinyQuote {
			symbol: string
			price: number
			eodPrice: number
			volume: number
			updated: number
		}

		interface Quote extends TinyQuote {
			tickerId: number
			status: string
			// 
			name: string
			typeof: keyof typeof rkeys.SYMBOLS
			exchangeName: string
			mic: string
			acronym: string
			country: string
			// 
			maker: string
			makerAddress: string
			vibrate: number
			yield: number
			// 
			price: number
			openPrice: number
			closePrice: number
			prevClose: number
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
			buyVolume: number
			sellVolume: number
			// 
			dealCount: number
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


