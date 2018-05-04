// 
export * from '../../common/webull'
// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as webull from '../../common/webull'
import * as http from './http'



export async function getFullQuotes(tickerIds: number[]) {
	let chunks = core.array.chunks(tickerIds, _.ceil(tickerIds.length / 512))
	let quotes = _.flatten(await Promise.all(chunks.map(function(chunk) {
		return http.get('https://quoteapi.webull.com/api/quote/tickerRealTimes/full', {
			query: { tickerIds: chunk.join(','), hl: 'en', },
			webullAuth: true,
		})
	}))) as Webull.Quote[]
	quotes.forEach(function(quote) {
		core.fix(quote)
		webull.fixQuote(quote)
	})
	return quotes
}



// export async function search(query: string) {
// 	// return got.get('https://infoapi.webull.com/api/search/tickers2', {
// 	// 	query: { keys: query },
// 	// 	json: true,
// 	// }).then(function({ body }) {
// 	// 	return body
// 	// })
// }


