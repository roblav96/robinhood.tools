// 

import * as qs from 'querystring'
import * as boom from 'boom'
import * as _ from './lodash'
import * as hours from './hours'
import * as http from './http'
import dayjs from './dayjs'



export const YH = {
	QUOTES: 'yh:quotes',
}



export const SUMMARY_MODULES = [
	// stocks
	'assetProfile', 'balanceSheetHistory', 'balanceSheetHistoryQuarterly', 'calendarEvents',
	'cashflowStatementHistory', 'cashflowStatementHistoryQuarterly', 'defaultKeyStatistics', 'earnings',
	'earningsHistory', 'earningsTrend', 'financialData', 'fundOwnership', 'incomeStatementHistory',
	'incomeStatementHistoryQuarterly', 'indexTrend', 'industryTrend', 'insiderHolders', 'insiderTransactions',
	'institutionOwnership', 'majorDirectHolders', 'majorHoldersBreakdown', 'netSharePurchaseActivity', 'price', 'quoteType',
	'recommendationTrend', 'secFilings', 'sectorTrend', 'summaryDetail', 'summaryProfile', 'symbol', 'upgradeDowngradeHistory',
	// funds
	'fundProfile', 'topHoldings', 'fundPerformance',
]



export const RANGES = ['1d', '5d', '1mo', '3mo', '6mo', 'ytd', '1y', '5y', '10y', 'max']
export const INTERVALS = ['1m', '2m', '5m', '15m', '30m', '1h', '1d', '1wk', '1mo']
export const FRAMES = {
	'1d': '1m',
	'5d': '15m',
	'1mo': '1h',
	'3mo': '1d',
	'6mo': '1d',
	'ytd': '1d',
	'1y': '1d',
	'2y': '1wk',
	'5y': '1wk',
	'10y': '1mo',
	'max': '1mo',
}

export function getChart(
	symbol: string,
	params: Partial<{ range: string, interval: string, includePrePost: boolean, period1: number, period2: number }>,
	hhours: Hours,
) {
	let state = hours.getState(hhours)
	if (params.range == '1d' && state.indexOf('PRE') == 0) {
		delete params.range
		if (dayjs(hhours.date).day() == 1) {
			params.period1 = dayjs(hhours.prepre).subtract(3, 'day').unix()
		} else params.period1 = dayjs(hhours.prepre).subtract(1, 'day').unix();
		params.period2 = dayjs(hhours.postpost).unix()
	}
	let url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + symbol
	return http.get(url, {
		query: params, proxify: !!process.env.CLIENT,
	}).then(function(response: Yahoo.ApiChart) {
		let error = _.get(response, 'chart.error') as Yahoo.ApiError
		if (error) throw boom.badRequest(JSON.stringify(response.chart.error));
		let lquotes = [] as Quotes.Live[]
		let result = response.chart.result[0]
		let stamps = result.timestamp
		if (!stamps) return lquotes;
		let hquotes = result.indicators.quote[0]
		stamps.forEach((stamp, i) => {
			if (!Number.isFinite(hquotes.close[i])) return;
			let prev = lquotes[i - 1] ? lquotes[i - 1].volume : 0
			lquotes.push({
				open: hquotes.open[i], close: hquotes.close[i],
				high: hquotes.high[i], low: hquotes.low[i],
				size: hquotes.volume[i], timestamp: stamp * 1000,
			} as Quotes.Live)
		})
		lquotes.sort((a, b) => a.timestamp - b.timestamp)
		lquotes.forEach((lquote, i) => {
			lquote.price = lquote.close
			let prev = lquotes[i - 1] ? lquotes[i - 1].volume : lquote.size
			lquote.volume = prev + lquote.size
		})
		return lquotes
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


