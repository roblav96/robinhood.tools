// 

import * as rkeys from './rkeys'
import * as _ from './lodash'
import * as core from './core'



export const fiats = [
	'AUD', 'CAD', 'CHF', 'CNH', 'CNY', 'EUR', 'GBP', 'HDK', 'JPY', 'NZD', 'RUB', 'USD',
] as string[]

export const indexes = [
	'RUI', 'RUT', // russell 2000
	'FVX', 'TNX', 'TYX', // treasury bonds
	'SRVIX', 'VIX', // volatility
] as string[]



export const WB = {
	SYMBOLS: 'wb:symbols',
	TIDS: 'wb:tids',
	TICKERS: 'wb:tickers',
	QUOTES: 'wb:quotes',
	DEALS: 'wb:deals',
}



export enum ticker_status {
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
Object.assign(ticker_status, _.invert(ticker_status))

export enum ticker_types {
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

export enum fund_types {
	ETF = 0,
	COMMON = 1,
}

export enum market_types {
	FUND = 0,
	ETF_FUND = 1,
	COMMODITY = 2,
	EXCHANGE = 3,
	GLOBALINDEX = 4,
	FOREX = 5,
}

export enum mqtt_topics {
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
				type: number
			}
			interface MarketIndex {
				labelId: number
				marketIndexList: Ticker[]
				regionLabelName: string
			}
			interface HotLists {
				hotEtf: {
					listId: string
					name: string
					ticker: Ticker
				}[]
				indexList: Ticker[]
				marketCategoryList: TupleArrayList<Ticker>[]
			}
		}

		interface Ticker {
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

		interface BidAsk { price: number, volume: number }

		interface Deal {
			symbol: string
			tickerId: number
			deal: number
			tradeBsFlag: 'N' | 'B' | 'S'
			tradeTime: number
			volume: number
		}

		interface Quote extends Deal {
			appNonETFData: {
				change: number
				changeRatio: number
				cumulativeNetValue: number
				netDate: string
				netValue: number
				threeMonthChangeRatio: number
			}
			ask: number
			askList: BidAsk[]
			askSize: number
			avg: number
			avgVol10D: number
			avgVol3M: number
			avgVolume: number
			baNum: number
			beta: number
			bid: number
			bidList: BidAsk[]
			bidSize: number
			change: number
			changeRatio: number
			close: number
			countryISOCode: string
			currency: string
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
			// mkTradeTime: number
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
			totalShares: number
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
			// typeof: keyof typeof rkeys.SYMBOLS
			// name: string
		}

	}
}


