// 

import * as _ from './lodash'
import * as core from './core'



export const WB = {
	WB: 'wb',
	TICKER_IDS: 'wb:tickerids',
	QUOTES: 'wb:quotes',
}



export enum TICKER_STATUS {
	CLOSED = 'B',
	DELISTED = '3',
	HAS_CLOSED = 'D',
	NOON_CLOSED = 'M',
	NOT_OPEN = 'H',
	OPENING = 'T',
	POST_TRADE = 'A',
	PRE_TRADE = 'F',
	SET_AUCTION = 'C',
	SUSPENSION = 'P',
	WILL_OPEN = 'W',
}
Object.assign(TICKER_STATUS, _.invert(TICKER_STATUS))

export enum TICKER_TYPES {
	INDICE = 1,
	STOCK = 2,
	FUND = 3,
	FUTURES = 4,
	BONDS = 5,
	EXCHANGE = 6,
	INDEX_FUTURES = 7,
	STOCK_FUTURES = 8,
	INDEX_OPTIONS = 9,
	STOCK_OPTIONS = 10,
	FUND_ETF = 34,
	FUTURES_COMMODITY = 40,
	FUTURES_INDEX = 41,
	FUTURES_STOCK = 42,
	INDEX_STOCK = 50,
	INDEX_CURRENCY = 51,
	INDEX_COMMODITY = 52,
	INDEX_FUND = 53,
}

export enum FUND_TYPES {
	ETF = 0,
	COMMON = 1,
}

export enum MARKET_TYPES {
	FUND = 0,
	ETF_FUND = 1,
	COMMODITY = 2,
	EXCHANGE = 3,
	GLOBALINDEX = 4,
	FOREX = 5,
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
				tid: string
			}
			interface Payload<T = any> {
				type: string
				data: T[]
			}
		}

		namespace Api {
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

		// interface FullSymbol {
		// 	0: string
		// 	1: number
		// }

		interface Ticker {
			[key: string]: any
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
		}

		interface Quote {
			[key: string]: any
			appNonETFData: {
				change: number
				changeRatio: number
				cumulativeNetValue: number
				netDate: string
				netValue: number
				threeMonthChangeRatio: number
			}
			ask: number
			askList: Array<{ price: number, volume: number }>
			askSize: number
			avg: number
			avgVol10D: number
			avgVol3M: number
			avgVolume: number
			baNum: number
			beta: number
			bid: number
			bidList: Array<{ price: number, volume: number }>
			bidSize: number
			change: number
			changeRatio: number
			close: number
			countryISOCode: string
			currency: string
			deal: number
			dealAmount: number
			dealNum: number
			dividend: number
			eps: number
			exchangeId: number
			extType: string[]
			faceValue: number
			faStatus: string
			faTradeTime: number
			fiftyTwoWkHigh: number
			fiftyTwoWkHighCalc: number
			fiftyTwoWkLow: number
			fiftyTwoWkLowCalc: number
			forwardPe: number
			high: number
			indicatedPe: number
			lfHigh: number
			lfLow: number
			limitDown: number
			limitUp: number
			lotSize: number
			low: number
			marketValue: number
			mktradeTime: number
			monthHigh: number
			monthLow: number
			negMarketValue: number
			nextEarningDay: string
			open: number
			outstandingShares: number
			pb: number
			pChange: number
			pChRatio: number
			pe: number
			peTtm: number
			positionsIncr: number
			positionsNum: number
			pPrice: number
			preChange: number
			preChangeRatio: number
			preClose: number
			preSettlement: number
			price: number
			projDps: number
			projEps: number
			projLtGrowthRate: number
			projPe: number
			projProfit: number
			projSales: number
			quoteMaker: string
			quoteMakerAddress: string
			regionAlias: string
			regionId: number
			settlDate: string
			settlement: number
			status: string
			symbol: string
			targetPrice: number
			tickerId: number
			timeZone: string
			topic: string
			totalShares: number
			tradeBsFlag: string
			tradeTime: number
			turnoverRate: number
			utcOffset: string
			vibrateRatio: number
			volume: number
			weekHigh: number
			weekLow: number
			yield: number
			yrHigh: number
			yrLow: number
		}

	}
}


