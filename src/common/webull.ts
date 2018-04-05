// 



export const TICKER_TYPES = {
	1: 'INDEX',
	2: 'STOCK',
	3: 'FUND',
	4: 'FUTURES',
	5: 'BOND',
	6: 'CURRENCY',
	34: 'FUND_ETF',
	40: 'FUTURES_COMMODITY',
	41: 'FUTURES_INDEX',
	42: 'FUTURES_STOCK',
	50: 'INDEX_STOCK',
	51: 'INDEX_CURRENCY',
	52: 'INDEX_COMMODITY',
	53: 'INDEX_FUND',
}



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
			change: number
			changeRatio: number
			close: number
			currencyId: number
			disExchangeCode: string
			disSymbol: string
			exchangeCode: string
			exchangeId: number
			exchangeName: string
			exchangeTrade: boolean
			fundSecType: number[]
			listStatus: number
			name: string
			price: number
			regionAlias: string
			regionAreaCode: string
			regionId: number
			regionIsoCode: string
			regionName: string
			secType: number[]
			showCode: string
			status: string
			symbol: string
			tickerId: number
			tickerName: string
			tickerStatus: string
			tickerSymbol: string
			tickerType: number
			tinyName: string
			type: number
			volume: number
		}



	}
}


