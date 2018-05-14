// 



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



export const YH = {
	QUOTES: 'yh:quotes',
}





declare global {
	namespace Yahoo {

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
		interface ApiQuote {
			quoteResponse: {
				result: Quote[]
				error: ApiError
			}
		}

		interface Summary {
			symbol: string
		}
		interface ApiSummary {
			quoteSummary: {
				result: Summary[]
				error: ApiError
			}
		}

		interface ApiError {
			code: string
			description: string
		}

	}
}


