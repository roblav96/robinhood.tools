// 



export const WB = {
	WB: 'wb',
	TICKER_IDS: 'wb:tickerids',
}



export const TICKER_STATUS = {
	'3': 'DELISTED',
	'W': 'WILL_OPEN',
	'C': 'SET_AUCTION',
	'T': 'OPENING',
	'F': 'PRE_TRADE',
	'A': 'POST_TRADE',
	'M': 'NOON_CLOSED',
	'B': 'CLOSED',
	'D': 'HAS_CLOSED',
	'H': 'NOT_OPEN',
	'P': 'SUSPENSION',
}

export const TICKER_TYPE = {
	'1': 'INDICE',
	'2': 'STOCK',
	'3': 'FUND',
	'4': 'FUTURES',
	'5': 'BONDS',
	'6': 'EXCHANGE',
	'7': 'INDEX_FUTURES',
	'8': 'STOCK_FUTURES',
	'9': 'INDEX_OPTIONS',
	'10': 'STOCK_OPTIONS',
}

export const FUND_TYPE = {
	'0': 'ETF',
	'1': 'COMMON',
}

export const MARKET_TYPE = {
	'0': 'FUND',
	'1': 'ETF_FUND',
	'2': 'COMMODITY',
	'3': 'EXCHANGE',
	'4': 'GLOBALINDEX',
	'5': 'FOREX',
}

export const TYPES = {
	'1': 'INDEX',
	'2': 'STOCK',
	'3': 'FUND',
	'4': 'FUTURES',
	'5': 'BOND',
	'6': 'CURRENCY',
	'34': 'FUND_ETF',
	'40': 'FUTURES_COMMODITY',
	'41': 'FUTURES_INDEX',
	'42': 'FUTURES_STOCK',
	'50': 'INDEX_STOCK',
	'51': 'INDEX_CURRENCY',
	'52': 'INDEX_COMMODITY',
	'53': 'INDEX_FUND',
}

export enum MQTT_TOPICS {
	MARKET_SECTOR = 1,
	MARKET_POSITIVE = 2,
	MARKET_DECLIE = 3,
	MARKET_TURNOVER_RATE = 4,
	TICKER = 5,
    TICKER_DETAIL = 6,
    TICKER_MARKET_INDEX = 8,
    COMMODITY = 9,
    FOREIGN_EXCHANGE = 10,
    MARKET_VOLUME = 11,
    TICKER_STATUS = 12,
    TICKER_HANDICAP = 13,
    TICKER_BID_ASK = 14,
    TICKER_DEAL_DETAILS = 15,
	MARKET_ETFS = 16,
}



declare global {
	namespace Webull {
		
		namespace Mqtt {
			interface Topic {
				type: string
				tid: number
			}
		}

		namespace API {
			interface Paginated<T = any> {
				categoryId: number
				categoryName: string
				hasMore: boolean
				list: T[]
			}
			interface TupleArrayList<T = any> {
				id: number
				name: string
				tickerTupleArrayList: T[]
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


