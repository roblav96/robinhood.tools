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
	EXCHANGES: 'wb:exchanges',
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

export function getType(wbtype: number) {
	let type = _.startCase(ticker_types[wbtype].toLowerCase())
	if (wbtype == 3) type = ticker_types[wbtype];
	return type
}

export enum ticker_types {
	INDEX = 1,
	STOCK = 2,
	ETF = 3, // FUND = 3,
	FUTURES = 4,
	BONDS = 5,
	CURRENCY = 6,
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



export function fix(quote: Partial<Webull.Ticker & Webull.Quote>) {
	if (quote.faStatus) quote.faStatus = ticker_status[quote.faStatus];
	if (quote.status0) quote.status0 = ticker_status[quote.status0];
	if (quote.status) quote.status = ticker_status[quote.status];

	if (quote.faTradeTime) quote.faTradeTime = new Date(quote.faTradeTime).valueOf();
	if (quote.mktradeTime) quote.mktradeTime = new Date(quote.mktradeTime).valueOf();
	if (quote.tradeTime) quote.tradeTime = new Date(quote.tradeTime).valueOf();

	Object.keys(quote).forEach(key => {
		let value = quote[key]
		if (key == 'symbol' || value == null) return;
		if (core.string.is(value) && !isNaN(value as any)) {
			quote[key] = Number.parseFloat(value)
		}
	})

	let bakeys = ['bid', 'ask']
	bakeys.forEach(key => {
		if (!Number.isFinite(quote[key])) delete quote[key];
		let lkey = `${key}List`
		let list = quote[lkey] as Webull.BidAsk[]
		if (Array.isArray(list)) {
			if (list.length > 0) {
				let prices = [] as number[]
				let volumes = [] as number[]
				list.forEach(v => {
					if (v.price) prices.push(Number.parseFloat(v.price as any));
					if (v.volume) volumes.push(Number.parseInt(v.volume as any));
				})
				quote[key] = _.mean(prices)
				quote[`${key}Size`] = _.sum(volumes)
			}
			delete quote[lkey]
		}
	})
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
				open: msplit[1], close: msplit[1],
				high: msplit[1], low: msplit[1],
				size: msplit[2], timestamp: msplit[0] * 1000,
			} as Quotes.Live)
		})
	})
	return lquotes.sort((a, b) => a.timestamp - b.timestamp)
}

export function toKDatasLives(response: Webull.KDatasChart) {
	return response.k.map(k => {
		let ksplit = k.split(',').map(Number.parseFloat)
		return {
			open: ksplit[3], close: ksplit[2],
			high: ksplit[4], low: ksplit[5],
			size: ksplit[6], timestamp: ksplit[0] * 1000,
		} as Quotes.Live
	}).sort((a, b) => a.timestamp - b.timestamp)
}





declare global {
	namespace Webull {

		namespace Mqtt {
			interface Topic {
				type: string
				tid: string
				rids: string
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
			interface KDates {
				avgShow: boolean
				end: string
				start: string
				type: string
			}
		}
		interface KDatasChart {
			dates: KDatasChart.KDates[]
			hasMoreData: boolean
			k: string[]
			preClose: number
			regionId: number
			tickerId: number
			tickerType: number
			timeZone: string
			tradeStatus: string
			version: number
			zzz: string
		}

		namespace Exchange {
			interface Region {
				countryCallingCode: string
				id: number
				isoCode: string
				mainCurrencyId: number
				name: string
			}
		}
		interface Exchange {
			amClose: string
			amOpen: string
			appRegion: Exchange.Region
			code: string
			id: number
			name: string
			pmClose: string
			pmOpen: string
			regionId: number
			showCode: string
			timeZone: string
		}

	}
}


