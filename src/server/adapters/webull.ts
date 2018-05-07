// 

export * from '../../common/webull'
export * from './webull.mqtt'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as webull from '../../common/webull'
import * as redis from './redis'
import * as http from './http'



export function fixQuote(quote: Webull.Quote) {
	if (quote.faStatus) quote.faStatus = webull.TICKER_STATUS[quote.faStatus];
	if (quote.status) quote.status = webull.TICKER_STATUS[quote.status];

	if (quote.faTradeTime) quote.faTradeTime = new Date(quote.faTradeTime).valueOf();
	if (quote.mkTradeTime) quote.mkTradeTime = new Date(quote.mkTradeTime).valueOf();
	if (quote.mktradeTime) quote.mktradeTime = new Date(quote.mktradeTime).valueOf();
	if (quote.tradeTime) quote.tradeTime = new Date(quote.tradeTime).valueOf();

	if (quote.bid == 0) delete quote.bid;
	if (Array.isArray(quote.bidList)) {
		if (quote.bidList.length > 0) {
			let bids = quote.bidList.map(v => ({
				price: Number.parseFloat(v.price as any),
				volume: Number.parseInt(v.volume as any),
			}))
			quote.bid = _.mean(bids.map(v => v.price))
			quote.bidSize = _.sum(bids.map(v => v.volume).concat(0))
		}
		delete quote.bidList
	}
	if (quote.ask == 0) delete quote.ask;
	if (Array.isArray(quote.askList)) {
		if (quote.askList.length > 0) {
			let asks = quote.askList.map(v => ({
				price: Number.parseFloat(v.price as any),
				volume: Number.parseInt(v.volume as any),
			}))
			quote.ask = _.mean(asks.map(v => v.price))
			quote.askSize = _.sum(asks.map(v => v.volume).concat(0))
		}
		delete quote.askList
	}

}



async function getChunked(fsymbols: Dict<number>, url: string, auth = false) {
	let inverse = _.invert(fsymbols)
	let tids = Object.values(fsymbols)
	let chunks = core.array.chunks(tids, _.ceil(tids.length / 512))
	let items = _.flatten(await Promise.all(chunks.map(function(chunk) {
		return http.get(url, {
			query: { tickerIds: chunk.join(','), hl: 'en', },
			webullAuth: auth,
		})
	}))) as any[]
	items.forEach(function(item) {
		core.fix(item)
		fixQuote(item)
		item.symbol = inverse[item.tickerId]
	})
	return items
}

export async function getFullQuotes(fsymbols: Dict<number>) {
	return await getChunked(fsymbols, 'https://quoteapi.webull.com/api/quote/tickerRealTimes/full', true) as Webull.Quote[]
}

export async function getTickers(fsymbols: Dict<number>) {
	return await getChunked(fsymbols, 'https://securitiesapi.webull.com/api/securities/ticker/v2') as Webull.Ticker[]
}

export async function syncTickersQuotes(fsymbols: Dict<number>) {
	let coms = [] as Redis.Coms
	let wbquotes = await getFullQuotes(fsymbols)
	wbquotes.forEach(function(v) {
		let rkey = `${rkeys.WB.QUOTES}:${v.symbol}`
		coms.push(['hmset', rkey, v as any])
	})
	let wbtickers = await getTickers(fsymbols)
	wbtickers.forEach(function(v) {
		let rkey = `${rkeys.WB.TICKERS}:${v.symbol}`
		coms.push(['hmset', rkey, v as any])
	})
	await redis.main.coms(coms)
}



// export async function search(query: string) {
// 	// return got.get('https://infoapi.webull.com/api/search/tickers2', {
// 	// 	query: { keys: query },
// 	// 	json: true,
// 	// }).then(function({ body }) {
// 	// 	return body
// 	// })
// }


