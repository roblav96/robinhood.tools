// 

export * from '../../common/webull'
export * from './webull.mqtt'
import * as pAll from 'p-all'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as webull from '../../common/webull'
import * as redis from './redis'
import * as http from './http'
import * as hours from './hours'



export function fix(quote: Webull.Quote) {
	if (quote.faStatus) quote.faStatus = webull.ticker_status[quote.faStatus];
	if (quote.status) quote.status = webull.ticker_status[quote.status];

	if (quote.faTradeTime) quote.faTradeTime = new Date(quote.faTradeTime).valueOf();
	if (quote.mkTradeTime) quote.mkTradeTime = new Date(quote.mkTradeTime).valueOf();
	if (quote.mktradeTime) quote.mktradeTime = new Date(quote.mktradeTime).valueOf();
	if (quote.tradeTime) quote.tradeTime = new Date(quote.tradeTime).valueOf();

	if (!quote.bid) delete quote.bid;
	if (Array.isArray(quote.bidList)) {
		if (quote.bidList.length > 0) {
			quote.bid = _.mean(quote.bidList.map(v => Number.parseFloat(v.price as any)))
			quote.bidSize = _.sum(quote.bidList.map(v => Number.parseInt(v.volume as any) || 0))
		}
		delete quote.bidList
	}
	if (!quote.ask) delete quote.ask;
	if (Array.isArray(quote.askList)) {
		if (quote.askList.length > 0) {
			quote.ask = _.mean(quote.askList.map(v => Number.parseFloat(v.price as any)))
			quote.askSize = _.sum(quote.askList.map(v => Number.parseInt(v.volume as any) || 0))
		}
		delete quote.askList
	}
}

export function parseStatus(quote: Quote, toquote: Quote, wbquote: Webull.Quote) {
	if (wbquote.faStatus && hours.rxstate.value != 'REGULAR' && wbquote.faStatus != quote.status) {
		toquote.status = wbquote.faStatus
	} else if (wbquote.status && wbquote.status != quote.status) {
		toquote.status = wbquote.status
	}
}

export function parseTicker(quote: Quote, toquote: Quote, wbquote: Webull.Quote) {
	if (wbquote.volume && wbquote.volume > quote.volume) toquote.volume = wbquote.volume;
	if (wbquote.dealNum && wbquote.dealNum != quote.dealCount) toquote.dealCount = wbquote.dealNum;
	if (wbquote.open && wbquote.open != quote.openPrice) toquote.openPrice = wbquote.open;
	if (wbquote.close && wbquote.close != quote.closePrice) toquote.closePrice = wbquote.close;
	if (wbquote.preClose && wbquote.preClose != quote.prevClose) toquote.prevClose = wbquote.preClose;
	if (wbquote.high && wbquote.high != quote.dayHigh) toquote.dayHigh = wbquote.high;
	if (wbquote.low && wbquote.low != quote.dayLow) toquote.dayLow = wbquote.low;
	if (wbquote.fiftyTwoWkHigh && wbquote.fiftyTwoWkHigh != quote.yearHigh) toquote.yearHigh = wbquote.fiftyTwoWkHigh;
	if (wbquote.fiftyTwoWkLow && wbquote.fiftyTwoWkLow != quote.yearLow) toquote.yearLow = wbquote.fiftyTwoWkLow;
	if (wbquote.avgVolume && wbquote.avgVolume != quote.avgVolume) toquote.avgVolume = wbquote.avgVolume;
	if (wbquote.avgVol10D && wbquote.avgVol10D != quote.avgVolume10Day) toquote.avgVolume10Day = wbquote.avgVol10D;
	if (wbquote.avgVol3M && wbquote.avgVol3M != quote.avgVolume3Month) toquote.avgVolume3Month = wbquote.avgVol3M;
	if (wbquote.totalShares && wbquote.totalShares != quote.sharesOutstanding) toquote.sharesOutstanding = wbquote.totalShares;
	if (wbquote.outstandingShares && wbquote.outstandingShares != quote.sharesFloat) toquote.sharesFloat = wbquote.outstandingShares;
	if (wbquote.tradeTime && wbquote.tradeTime > quote.updated) {
		toquote.updated = wbquote.tradeTime
		if (wbquote.price && wbquote.price > 0) {
			if (wbquote.tradeTime == wbquote.mkTradeTime) toquote.price = wbquote.price;
			if (wbquote.tradeTime == wbquote.mktradeTime) toquote.price = wbquote.price;
		}
		if (wbquote.pPrice && wbquote.pPrice > 0) {
			if (wbquote.tradeTime == wbquote.faTradeTime) toquote.price = wbquote.pPrice;
		}
		if (toquote.price) toquote.marketCap = Math.round(toquote.price * quote.sharesOutstanding);
	}
}

export function parseBidAsk(quote: Quote, toquote: Quote, wbquote: Webull.Quote) {
	if (wbquote.bid && wbquote.bid != quote.bidPrice) toquote.bidPrice = wbquote.bid;
	if (wbquote.bidSize && wbquote.bidSize != quote.bidSize) toquote.bidSize = wbquote.bidSize;
	if (wbquote.ask && wbquote.ask != quote.askPrice) toquote.askPrice = wbquote.ask;
	if (wbquote.askSize && wbquote.askSize != quote.askSize) toquote.askSize = wbquote.askSize;
}

export function parseDeal(quote: Quote, toquote: Quote, wbdeal: Webull.Deal) {
	if (wbdeal.tradeTime && wbdeal.tradeTime > quote.updated) {
		toquote.updated = wbdeal.tradeTime
		toquote.price = wbdeal.deal
	}
	if (wbdeal.volume) {
		if (wbdeal.tradeBsFlag == 'B') {
			toquote.buyVolume = quote.buyVolume + wbdeal.volume
		} else if (wbdeal.tradeBsFlag == 'S') {
			toquote.sellVolume = quote.sellVolume + wbdeal.volume
		} else {
			toquote.volume = quote.volume + wbdeal.volume
		}
	}
}



async function getChunked(fsymbols: Dict<number>, url: string, auth = false) {
	let inverse = _.invert(fsymbols)
	let tids = Object.values(fsymbols)
	let chunks = core.array.chunks(tids, _.ceil(tids.length / 128))
	let items = await pAll(chunks.map(chunk => {
		return () => http.get(url, {
			query: { tickerIds: chunk.join(',') }, webullAuth: auth,
		})
	}), { concurrency: 1 })
	items = _.flatten(items)
	items.forEach(function(item) {
		core.fix(item)
		fix(item)
		item.symbol = inverse[item.tickerId]
	})
	return items
}

export function getFullQuotes(fsymbols: Dict<number>): Promise<Webull.Quote[]> {
	return getChunked(fsymbols, 'https://quoteapi.webull.com/api/quote/tickerRealTimes/full', true)
}

export function getTickers(fsymbols: Dict<number>): Promise<Webull.Ticker[]> {
	return getChunked(fsymbols, 'https://securitiesapi.webull.com/api/securities/ticker/v2')
}

export async function syncTickersQuotes(fsymbols: Dict<number>) {
	let coms = []
	let wbquotes = await getFullQuotes(fsymbols)
	wbquotes.forEach(function(v) {
		let rkey = `${rkeys.WB.QUOTES}:${v.symbol}`
		coms.push(['hmset', rkey, v])
	})
	let wbtickers = await getTickers(fsymbols)
	wbtickers.forEach(function(v) {
		let rkey = `${rkeys.WB.TICKERS}:${v.symbol}`
		coms.push(['hmset', rkey, v])
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


