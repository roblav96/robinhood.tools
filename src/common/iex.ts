// 



export const IEX = {
	ITEMS: 'iex:items',
}



export const BATCH_TYPES = [
	'book',
	'company',
	'dividends',
	'earnings',
	'effective-spread',
	'estimates',
	'financials',
	'news',
	'peers',
	'quote',
	'relevant',
	'splits',
	'stats',
	'volume-by-venue',
]



export const ISSUE_TYPES = {
	// '': `Not Available, Warrant, Note, or Non-Filing`,
	'': `Not Available or Non-Filing`,
	ad: `American Depository Receipt (ADR)`,
	re: `Real Estate Investment Trust (REIT)`,
	ce: `Closed End Fund (Stock and Bond Fund)`,
	si: `Secondary Issue`,
	lp: `Limited Partnerships`,
	cs: `Common Stock`,
	et: `Exchange Traded Fund (ETF)`,
}
export function issueType(type = '') { return ISSUE_TYPES[type] }



declare global {
	namespace Iex {

		type BatchResponse = { [symbol: string]: Batch }
		interface Batch {
			'company': Company
			'earnings': EarningsMeta
			'effective-spread': EffectiveSpread[]
			'financials': FinancialsMeta
			'news': News[]
			'open-close': OpenClose
			'peers': string[]
			'quote': Quote
			'relevant': Relevant
			'splits': Split[]
			'stats': Stats
		}

		interface Item extends Relevant, News, Company, EarningsMeta, EstimatesMeta, EffectiveSpread, EffectiveSpreadMeta, FinancialsMeta, Quote, Stats {
			symbol: string
		}

		interface Relevant {
			peers: boolean
			symbols: string[]
		}

		interface News {
			datetime: string
			headline: string
			related: string
			source: string
			summary: string
			url: string
		}

		interface Company {
			CEO: string
			companyName: string
			description: string
			exchange: string
			industry: string
			issueType: string
			sector: string
			symbol: string
			website: string
		}

		interface EarningsMeta {
			earnings: Earnings[]
			symbol: string
		}
		interface Earnings {
			actualEPS: number
			announceTime: string
			consensusEPS: number
			EPSReportDate: string
			EPSSurpriseDollar: number
			estimatedChangePercent: number
			estimatedEPS: number
			fiscalEndDate: string
			fiscalPeriod: string
			numberOfEstimates: number
			symbolId: number
			yearAgo: number
			yearAgoChangePercent: number
		}

		interface EstimatesMeta {
			estimates: Estimates[]
			symbol: string
		}
		interface Estimates {
			actualEPS: number
			announceTime: number
			consensusEPS: number
			EPSReportDate: string
			EPSSurpriseDollar: number
			estimatedChangePercent: number
			estimatedEPS: number
			fiscalEndDate: string
			fiscalPeriod: string
			numberOfEstimates: number
			symbolId: number
			yearAgo: number
			yearAgoChangePercent: number
		}

		interface EffectiveSpread {
			effectiveQuoted: number
			effectiveSpread: number
			priceImprovement: number
			venue: string
			venueName: string
			volume: number
		}
		interface EffectiveSpreadMeta {
			spreads: EffectiveSpread[]
			symbol: string
		}

		interface FinancialsMeta {
			financials: Financials[]
			symbol: string
		}
		interface Financials {
			cashChange: number
			cashFlow: number
			costOfRevenue: number
			currentAssets: number
			currentCash: number
			currentDebt: number
			grossProfit: number
			netIncome: number
			operatingExpense: number
			operatingGainsLosses: number
			operatingIncome: number
			operatingRevenue: number
			reportDate: string
			researchAndDevelopment: number
			shareholderEquity: number
			totalAssets: number
			totalCash: number
			totalDebt: number
			totalLiabilities: number
			totalRevenue: number
		}

		interface OpenClose {
			close: OpenCloseData
			open: OpenCloseData
		}
		interface OpenCloseData {
			price: number
			time: number
		}

		interface Quote {
			avgTotalVolume: number
			calculationPrice: string
			change: number
			changePercent: number
			close: number
			closeTime: number
			companyName: string
			delayedPrice: number
			delayedPriceTime: number
			high: number
			iexAskPrice: number
			iexAskSize: number
			iexBidPrice: number
			iexBidSize: number
			iexLastUpdated: number
			iexMarketPercent: number
			iexRealtimePrice: number
			iexRealtimeSize: number
			iexVolume: number
			latestPrice: number
			latestSource: string
			latestTime: string
			latestUpdate: number
			latestVolume: number
			low: number
			marketCap: number
			open: number
			openTime: number
			peRatio: number
			previousClose: number
			primaryExchange: string
			sector: string
			symbol: string
			week52High: number
			week52Low: number
			ytdChange: number
		}

		interface Stats {
			beta: number
			cash: number
			companyName: string
			consensusEPS: number
			day200MovingAvg: number
			day50MovingAvg: number
			day5ChangePercent: number
			debt: number
			dividendRate: number
			dividendYield: number
			EBITDA: number
			EPSSurpriseDollar: number
			EPSSurprisePercent: number
			exDividendDate: number
			float: number
			grossProfit: number
			insiderPercent: number
			institutionPercent: number
			latestEPS: number
			latestEPSDate: string
			marketcap: number
			month1ChangePercent: number
			month3ChangePercent: number
			month6ChangePercent: number
			numberOfEstimates: number
			peRatioHigh: number
			peRatioLow: number
			priceToBook: number
			priceToSales: number
			profitMargin: number
			returnOnAssets: number
			returnOnCapital: number
			returnOnEquity: number
			revenue: number
			revenuePerEmployee: number
			revenuePerShare: number
			sharesOutstanding: number
			shortDate: string
			shortInterest: number
			shortRatio: number
			symbol: string
			ttmEPS: number
			week52change: number
			week52high: number
			week52low: number
			year1ChangePercent: number
			year2ChangePercent: number
			year5ChangePercent: number
			ytdChangePercent: number
		}

		interface Split {
			declaredDate: string
			exDate: string
			forFactor: number
			paymentDate: string
			ratio: number
			recordDate: string
			toFactor: number
		}

		interface TopsMessage {
			askPrice: number
			askSize: number
			bidPrice: number
			bidSize: number
			lastSalePrice: number
			lastSaleSize: number
			lastSaleTime: number
			lastUpdated: number
			marketPercent: number
			symbol: string
			volume: number
		}

		interface EventMessage {
			data: EventMessageMeta
			messageType: string
			symbol: string
		}
		interface EventMessageMeta {
			detail: string
			isHalted: boolean
			isSSR: boolean
			reason: string
			securityEvent: string
			status: string
			systemEvent: string
			timestamp: number
		}

	}
}


