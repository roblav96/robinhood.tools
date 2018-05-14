// 

export * from '../../common/yahoo'
import * as pAll from 'p-all'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as yahoo from '../../common/yahoo'
import * as redis from './redis'
import * as http from './http'



export async function getQuotes(symbols: string[]) {
	let chunks = core.array.chunks(symbols, _.ceil(symbols.length / 256)).map(v => v.join(','))
	let resolved = await pAll(chunks.map(chunk => {
		return () => http.get('https://query2.finance.yahoo.com/v7/finance/quote', {
			query: { symbols: chunk },
		})
	}), { concurrency: 1 }) as Yahoo.ApiQuote[]
	let quotes = _.flatten(resolved.map(v => v.quoteResponse.result)).filter(v => v)
	quotes.forEach(v => v.symbol = v.symbol.toUpperCase())
	return quotes
}



export async function getSummary(symbol: string) {
	let response = await http.get('https://query2.finance.yahoo.com/v10/finance/quoteSummary/' + symbol, {
		query: { modules: yahoo.SUMMARY_MODULES.join(','), formatted: false },
	}) as Yahoo.ApiSummary
	let summary = response.quoteSummary.result[0]
	summary.symbol = symbol
	return summary
}







