// 

export * from '../../common/webull'
export * from './webull.mqtt'
import { DateTime } from 'luxon'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as webull from '../../common/webull'
import * as http from './http'



export function fixQuote(quote: Webull.Quote) {
	if (quote.status) quote.status = webull.TICKER_STATUS[quote.status];

	if (quote.faTradeTime) quote.faTradeTime = DateTime.fromISO(quote.faTradeTime as any).valueOf();
	if (quote.mktradeTime) quote.mktradeTime = DateTime.fromISO(quote.mktradeTime as any).valueOf();
	if (quote.tradeTime) quote.tradeTime = DateTime.fromISO(quote.tradeTime as any).valueOf();
	// if (quote.nextEarningDay) quote.nextEarningDay = DateTime.fromISO(quote.nextEarningDay as any).valueOf();

	if (Array.isArray(quote.bidList) && quote.bidList.length > 0) {
		quote.bidList.forEach(v => core.fix(v))
		quote.bid = _.max(_.compact(quote.bidList.map(v => v.price)))
		quote.bidSize = _.sum(quote.bidList.map(v => v.volume).concat(0))
	}
	delete quote.bidList
	if (Array.isArray(quote.askList) && quote.askList.length > 0) {
		quote.askList.forEach(v => core.fix(v))
		quote.ask = _.min(_.compact(quote.askList.map(v => v.price)))
		quote.askSize = _.sum(quote.askList.map(v => v.volume).concat(0))
	}
	delete quote.askList

}



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
		fixQuote(quote)
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


