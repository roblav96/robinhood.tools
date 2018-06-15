// 

import * as rkeys from './rkeys'
import * as _ from './lodash'
import * as core from './core'



export const WB = {
	SYMBOLS: 'wb:symbols',
	TIDS: 'wb:tids',
	TICKERS: 'wb:tickers',
	QUOTES: 'wb:quotes',
	DEALS: 'wb:deals',
}

export const forex = [
	'BTCUSD', 'XAUUSD', 'XAGUSD',
]
export const fiats = [
	'AUD', 'CAD', 'CHF', 'CNH', 'CNY', 'EUR', 'GBP', 'HDK', 'JPY', 'KRW', 'MXN', 'NZD', 'RUB', 'SEK', 'USD',
]

export const indexes = [
	'ESc1', '1YMc1', 'NQc1', // futures
	'CLc2', 'GCc2', 'SIc2', 'HGc2', // continuations
	'RUI', 'RUT', // russell 2000
	'FVX', 'TNX', 'TYX', // treasury bonds
	'SRVIX', 'VIX', // volatility
]

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



export function fixSymbol(symbol: string) {
	if (symbol.indexOf('-') == -1) return symbol;
	let split = symbol.split('-')
	let start = split.shift()
	let end = split.pop()
	let middle = end.length == 1 ? '.' : '-'
	return start + middle + end.slice(-1)
}

export function toMinutesLives(response: Webull.MinuteChart) {
	let lquotes = [] as Quotes.Live[]
	response.data.forEach(data => {
		data.tickerMinutes.forEach(minute => {
			let msplit = minute.split(',').map(Number.parseFloat)
			lquotes.push({
				close: msplit[1], size: msplit[2],
				timestamp: msplit[0] * 1000,
			} as Quotes.Live)
		})
	})
	return lquotes.sort((a, b) => a.timestamp - b.timestamp)
}

export function toKDatasLives(response: Webull.KDatasChart) {
	return response.tickerKDatas.map(kdata => {
		return {
			open: kdata.noneKData.open, close: kdata.noneKData.close,
			high: kdata.noneKData.high, low: kdata.noneKData.low,
			size: kdata.volume, timestamp: new Date(kdata.tradeTime).valueOf(),
		} as Quotes.Live
	}).sort((a, b) => a.timestamp - b.timestamp)
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

		interface Item extends Ticker, Quote {
			symbol: string
		}

		interface Ticker {
			currencyId: number
			currencyCode: string
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
			deal: number
			symbol: string
			tickerId: number
			tradeBsFlag: 'N' | 'B' | 'S'
			tradeTime: number
			volume: number
		}

		interface Quote extends Deal {
			typeof: TypeOfSymbols
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
			marketOpenTime: string
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
			status0: string
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
		}

		namespace MinuteChart {
			interface Data {
				dates: Date[]
				tickerMinutes: string[]
			}
			interface Date {
				avgShow: boolean
				end: number
				start: number
				type: string
			}
		}
		interface MinuteChart {
			cleanDuration: number
			cleanTime: number
			code: number
			data: MinuteChart.Data[]
			pVol: number
			preClose: number
			regionId: number
			status: string
			tickerType: number
			timeZone: string
		}

		namespace KDatasChart {
			interface ForwardKData {
				close: number
				high: number
				low: number
				ma10: number
				ma120: number
				ma20: number
				ma30: number
				ma5: number
				ma60: number
				open: number
				preClose: number
			}
			interface NoneKData {
				close: number
				high: number
				low: number
				ma10: number
				ma120: number
				ma20: number
				ma30: number
				ma5: number
				ma60: number
				open: number
				preClose: number
			}
			interface KDatas {
				dealAmount: number
				forwardKData: ForwardKData
				noneKData: NoneKData
				tickerId: number
				tradeTime: string
				volume: number
			}
		}
		interface KDatasChart {
			hasMoreData: boolean
			regionId: number
			tickerId: number
			tickerKDatas: KDatasChart.KDatas[]
			tickerType: number
			timeZone: string
			version: string
			zzz: string
		}

	}
}


