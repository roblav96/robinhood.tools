//

import * as qs from 'querystring'
import * as boom from 'boom'
import * as dayjs from 'dayjs'
import * as _ from './lodash'
import * as hours from './hours'
import * as http from './http'

export const YH = {
	QUOTES: 'yh:quotes',
}

export function toSymbol(symbol: string) {
	if (symbol.includes('.')) return symbol.replace('.', '-')
	if (symbol.includes('-')) return symbol.replace('-', '-P')
	return symbol
}
export function fromSymbol(symbol: string) {
	if (symbol.includes('-P')) return symbol.replace('-P', '-')
	if (symbol.includes('-')) return symbol.replace('-', '.')
	return symbol
}

export function fixName(name: string) {
	return (
		name &&
		name
			.replace(/&amp;+/g, '&')
			.replace(/[Â]+/g, '')
			.trim()
	)
}

export const SUMMARY_MODULES = [
	'assetProfile',
	'balanceSheetHistory',
	'balanceSheetHistoryQuarterly',
	'calendarEvents',
	'cashflowStatementHistory',
	'cashflowStatementHistoryQuarterly',
	'components',
	'defaultKeyStatistics',
	'description',
	'earnings',
	'earningsHistory',
	'earningsTrend',
	'esgScores',
	'financialData',
	'fundOwnership',
	'fundPerformance',
	'fundProfile',
	'incomeStatementHistory',
	'incomeStatementHistoryQuarterly',
	'indexTrend',
	'industryTrend',
	'insiderHolders',
	'insiderTransactions',
	'institutionOwnership',
	'majorDirectHolders',
	'majorHoldersBreakdown',
	'netSharePurchaseActivity',
	'price',
	'quoteType',
	'recommendationTrend',
	'secFilings',
	'sectorTrend',
	'summaryDetail',
	'summaryProfile',
	'symbol',
	'topHoldings',
	'upgradeDowngradeHistory',
]

export const ALL_RANGES = [
	'1d',
	'5d',
	'1wk',
	'1mo',
	'3mo',
	'6mo',
	'ytd',
	'1y',
	'2y',
	'5y',
	'10y',
	'max',
]
export const ALL_INTERVALS = [
	'1m',
	'2m',
	'5m',
	'15m',
	'30m',
	'60m',
	'90m',
	'1h',
	'1d',
	'5d',
	'1wk',
	'1mo',
	'3mo',
]

export const FRAMES = {
	'1d': '1m',
	'5d': '5m',
	'1mo': '1h',
	'1y': '1d',
	'5y': '1wk',
	'max': '1mo',
}
export const RANGES = Object.keys(FRAMES)
export const INTERVALS = ['1m', '2m', '5m', '15m', '30m', '1h', '1d', '1wk', '1mo']

export function getChart(symbol: string, params: Partial<Yahoo.ChartParams>) {
	return http
		.get(`https://query1.finance.yahoo.com/v8/finance/chart/${toSymbol(symbol)}`, {
			query: params,
			proxify: !!process.env.CLIENT,
			retries: 3,
			timeout: 5000,
		})
		.then(function (response: Yahoo.ApiChart) {
			let error = _.get(response, 'chart.error') as Yahoo.ApiError
			if (error) throw boom.badRequest(`chart.error -> ${JSON.stringify(error)}`, response)
			let result = _.get(response, 'chart.result[0]') as Yahoo.ChartResult
			if (!result)
				throw boom.expectationFailed(`!result -> ${JSON.stringify(response)}`, response)
			let lquotes = [] as Quotes.Live[]
			let stamps = result.timestamp
			if (!stamps)
				throw boom.expectationFailed(`!stamps -> ${JSON.stringify(response)}`, response)
			let hquotes = result.indicators.quote[0]
			stamps.forEach((stamp, i) => {
				if (!Number.isFinite(hquotes.close[i])) return
				lquotes.push({
					open: hquotes.open[i],
					close: hquotes.close[i],
					high: hquotes.high[i],
					low: hquotes.low[i],
					size: hquotes.volume[i],
					timestamp: stamp * 1000,
				} as Quotes.Live)
			})
			return lquotes.sort((a, b) => a.timestamp - b.timestamp)
		})
}

declare global {
	namespace Yahoo {
		interface ApiError {
			code: string
			description: string
		}

		interface ApiQuote {
			quoteResponse: {
				result: Quote[]
				error: ApiError
			}
		}
		interface Quote {
			ask: number
			askSize: number
			averageDailyVolume10Day: number
			averageDailyVolume3Month: number
			bid: number
			bidSize: number
			currency: string
			esgPopulated: boolean
			exchange: string
			exchangeDataDelayedBy: number
			exchangeTimezoneName: string
			exchangeTimezoneShortName: string
			fiftyDayAverage: number
			fiftyDayAverageChange: number
			fiftyDayAverageChangePercent: number
			fiftyTwoWeekHigh: number
			fiftyTwoWeekHighChange: number
			fiftyTwoWeekHighChangePercent: number
			fiftyTwoWeekLow: number
			fiftyTwoWeekLowChange: number
			fiftyTwoWeekLowChangePercent: number
			fiftyTwoWeekRange: string
			financialCurrency: string
			fullExchangeName: string
			gmtOffSetMilliseconds: number
			language: string
			longName: string
			market: string
			marketCap: number
			marketState: string
			messageBoardId: string
			preMarketChange: number
			preMarketChangePercent: number
			preMarketPrice: number
			preMarketTime: number
			priceHint: number
			quoteSourceName: string
			quoteType: string
			regularMarketChange: number
			regularMarketChangePercent: number
			regularMarketDayHigh: number
			regularMarketDayLow: number
			regularMarketDayRange: string
			regularMarketOpen: number
			regularMarketPreviousClose: number
			regularMarketPrice: number
			regularMarketTime: number
			regularMarketVolume: number
			sharesOutstanding: number
			shortName: string
			sourceInterval: number
			symbol: string
			tradeable: boolean
			trailingThreeMonthNavReturns: number
			trailingThreeMonthReturns: number
			twoHundredDayAverage: number
			twoHundredDayAverageChange: number
			twoHundredDayAverageChangePercent: number
			ytdReturn: number
		}

		interface ApiSummary {
			quoteSummary: {
				result: Summary[]
				error: ApiError
			}
		}
		interface Summary {
			symbol: string
		}

		interface ChartParams {
			range: string
			interval: string
			includePrePost: boolean
			period1: number
			period2: number
		}
		interface ApiChart {
			chart: {
				result: ChartResult[]
				error: ApiError
			}
		}
		interface ChartResult {
			meta: {
				currency: string
				symbol: string
				exchangeName: string
				instrumentType: string
				firstTradeDate: number
				gmtoffset: number
				timezone: string
				previousClose: number
				scale: number
				currentTradingPeriod: {
					pre: ChartTradingPeriod
					regular: ChartTradingPeriod
					post: ChartTradingPeriod
				}
				tradingPeriods: ChartTradingPeriod[]
				dataGranularity: string
				validRanges: string[]
			}
			timestamp: number[]
			indicators: {
				quote: ChartQuote[]
			}
		}
		interface ChartTradingPeriod {
			timezone: string
			end: number
			start: number
			gmtoffset: number
		}
		interface ChartQuote {
			open: number[]
			close: number[]
			high: number[]
			low: number[]
			volume: number[]
		}

		interface ApiSparks {
			spark: {
				result: SparkResult[]
				error: ApiError
			}
		}
		interface SparkResult {
			symbol: string
			response: ChartResult[]
		}
	}
}
