// 

export { }





declare global {

	interface Quote {
		symbol: string
		tickerId: number
		updated: number
		status: string
		// 
		name: string
		tradable: boolean
		type: Robinhood.Instrument.Type
		listDate: number
		mic: string
		acronym: string
		country: string
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
	}

	namespace Quote {
		interface Deal {
			symbol: string
			price: number
			size: number
			side: 'B' | 'S'
			time: number
		}
	}

}


