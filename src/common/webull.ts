// 



export { }





declare global {
	namespace Webull {

		namespace API {
			interface Paginated<T = any> {
				categoryId: number
				categoryName: string
				hasMore: boolean
				list: T[]
			}
		}

		interface Ticker {
			currencyId: number
			disExchangeCode: string
			disSymbol: string
			exchangeCode: string
			exchangeId: number
			exchangeName: string
			listStatus: number
			regionAlias: string
			regionAreaCode: string
			regionId: number
			regionName: string
			showCode: string
			tickerId: number
			tickerName: string
			tickerStatus: string
			tickerSymbol: string
			tickerType: number
			tinyName: string
			exchangeTrade: boolean
			fundSecType: number[]
			secType: number[]
			change: number
			changeRatio: number
			close: number
			name: string
			price: number
			regionIsoCode: string
			symbol: string
			type: number
			volume: number
			status: string
		}



	}
}


