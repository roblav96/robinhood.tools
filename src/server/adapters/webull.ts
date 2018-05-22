// 

export * from '../../common/webull'
export * from './webull.mqtt'
import * as pAll from 'p-all'
import * as boom from 'boom'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as webull from '../../common/webull'
import * as redis from './redis'
import * as http from './http'



export function fix(quote: Webull.Quote) {
	if (quote.faStatus) quote.faStatus = webull.ticker_status[quote.faStatus];
	if (quote.status) quote.status = webull.ticker_status[quote.status];
	if (quote.status0) quote.status0 = webull.ticker_status[quote.status0];

	if (quote.faTradeTime) quote.faTradeTime = new Date(quote.faTradeTime).valueOf();
	if (quote.mktradeTime) quote.mktradeTime = new Date(quote.mktradeTime).valueOf();
	if (quote.tradeTime) quote.tradeTime = new Date(quote.tradeTime).valueOf();

	['bid', 'ask'].forEach(key => {
		if (!quote[key]) delete quote[key];
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



async function getItems(fsymbols: Dict<number>, url: string, wbauth = false) {
	let inverse = _.invert(fsymbols)
	let tickerIds = Object.values(fsymbols)
	if (tickerIds.length > 128) throw boom.entityTooLarge('tickerIds -> ' + tickerIds.length)
	return http.get(url, {
		query: { tickerIds: tickerIds.join(','), hl: 'en' }, wbauth,
	}).then((items: any[]) => {
		items.forEach(item => {
			core.fix(item)
			fix(item)
			item.symbol = inverse[item.tickerId]
		})
		return items
	})
}

export function getFullQuotes(fsymbols: Dict<number>): Promise<Webull.Quote[]> {
	return getItems(fsymbols, 'https://quoteapi.webull.com/api/quote/tickerRealTimes/full', true)
}

export function getTickers(fsymbols: Dict<number>): Promise<Webull.Ticker[]> {
	return getItems(fsymbols, 'https://securitiesapi.webull.com/api/securities/ticker/v2')
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





// async function getChunked(fsymbols: Dict<number>, url: string, wbauth = false) {
// 	let inverse = _.invert(fsymbols)
// 	let tids = Object.values(fsymbols)
// 	let chunks = core.array.chunks(tids, _.ceil(tids.length / 100)).map(v => v.join(','))
// 	return _.flatten(await pAll(chunks.map(chunk => {
// 		return () => http.get(url, {
// 			query: { tickerIds: chunk, hl: 'en' }, wbauth,
// 		}).then((items: any[]) => {
// 			items.forEach(item => {
// 				core.fix(item)
// 				fix(item)
// 				item.symbol = inverse[item.tickerId]
// 			})
// 			return items
// 		})
// 	}), { concurrency: 1 }))
// }



// export function onQuote({
// 	quote, wbquote, toquote, filter,
// }: {
// 		quote: Quote,
// 		wbquote: Webull.Quote,
// 		toquote?: Quote,
// 		filter?: 'all' | 'status' | 'bidask' | 'ticker' | 'deal'
// 	}
// ) {
// 	toquote = toquote || {} as any
// 	filter = filter || 'all'

// 	// console.warn('onQuote ->', quote.symbol)
// 	// console.log('quote ->', quote)
// 	// console.log('wbquote ->', wbquote)
// 	// console.log('toquote ->', toquote)

// 	if (filter == 'all') {
// 		if (wbquote.avgVolume && wbquote.avgVolume != quote.avgVolume) toquote.avgVolume = wbquote.avgVolume;
// 		if (wbquote.avgVol10D && wbquote.avgVol10D != quote.avgVolume10Day) toquote.avgVolume10Day = wbquote.avgVol10D;
// 		if (wbquote.avgVol3M && wbquote.avgVol3M != quote.avgVolume3Month) toquote.avgVolume3Month = wbquote.avgVol3M;
// 		if (wbquote.totalShares && wbquote.totalShares != quote.sharesOutstanding) toquote.sharesOutstanding = wbquote.totalShares;
// 		if (wbquote.outstandingShares && wbquote.outstandingShares != quote.sharesFloat) toquote.sharesFloat = wbquote.outstandingShares;
// 	}

// 	if (filter == 'all' || filter == 'status') {
// 		if (wbquote.faStatus && wbquote.faStatus != quote.status) {
// 			toquote.status = wbquote.faStatus
// 		} else if (wbquote.status && wbquote.status != quote.status) {
// 			toquote.status = wbquote.status
// 		}
// 	}

// 	if (filter == 'all' || filter == 'bidask') {
// 		if (wbquote.bid && wbquote.bid != quote.bidPrice) toquote.bidPrice = wbquote.bid;
// 		if (wbquote.bidSize && wbquote.bidSize != quote.bidSize) toquote.bidSize = wbquote.bidSize;
// 		if (wbquote.ask && wbquote.ask != quote.askPrice) toquote.askPrice = wbquote.ask;
// 		if (wbquote.askSize && wbquote.askSize != quote.askSize) toquote.askSize = wbquote.askSize;
// 	}

// 	if (filter == 'all' || filter == 'ticker') {
// 		if (wbquote.open && wbquote.open != quote.openPrice) toquote.openPrice = wbquote.open;
// 		if (wbquote.close && wbquote.close != quote.closePrice) toquote.closePrice = wbquote.close;
// 		if (wbquote.preClose && wbquote.preClose != quote.prevClose) toquote.prevClose = wbquote.preClose;
// 		if (wbquote.high && wbquote.high != quote.dayHigh) toquote.dayHigh = wbquote.high;
// 		if (wbquote.low && wbquote.low != quote.dayLow) toquote.dayLow = wbquote.low;
// 		if (wbquote.fiftyTwoWkHigh && wbquote.fiftyTwoWkHigh != quote.yearHigh) toquote.yearHigh = wbquote.fiftyTwoWkHigh;
// 		if (wbquote.fiftyTwoWkLow && wbquote.fiftyTwoWkLow != quote.yearLow) toquote.yearLow = wbquote.fiftyTwoWkLow;
// 		if (wbquote.quoteMaker && wbquote.quoteMaker != quote.maker) toquote.maker = wbquote.quoteMaker;
// 		if (wbquote.quoteMakerAddress && wbquote.quoteMakerAddress != quote.makerAddress) toquote.makerAddress = wbquote.quoteMakerAddress;
// 		if (wbquote.yield && wbquote.yield != quote.yield) toquote.yield = wbquote.yield;
// 		if (wbquote.vibrateRatio && wbquote.vibrateRatio != quote.vibrate) toquote.vibrate = wbquote.vibrateRatio;

// 		if (wbquote.volume && wbquote.volume != quote.volume) toquote.volume = wbquote.volume;
// 		if (wbquote.dealNum && wbquote.dealNum != quote.dealCount) toquote.dealCount = wbquote.dealNum;

// 		if (wbquote.tradeTime && wbquote.tradeTime > quote.updated) {
// 			toquote.updated = wbquote.tradeTime
// 			if (wbquote.price && wbquote.price > 0) {
// 				if (wbquote.tradeTime == wbquote.mkTradeTime) toquote.price = wbquote.price;
// 				if (wbquote.tradeTime == wbquote.mktradeTime) toquote.price = wbquote.price;
// 			}
// 			if (wbquote.pPrice && wbquote.pPrice > 0) {
// 				if (wbquote.tradeTime == wbquote.faTradeTime) toquote.price = wbquote.pPrice;
// 			}
// 		}
// 	}

// 	if (filter == 'deal') {
// 		if (wbquote.tradeTime && wbquote.tradeTime > quote.updated) {
// 			toquote.updated = wbquote.tradeTime
// 			toquote.price = wbquote.deal
// 		}
// 		if (wbquote.volume) {
// 			if (wbquote.tradeBsFlag == 'B') {
// 				toquote.buyVolume = quote.buyVolume + wbquote.volume
// 			} else if (wbquote.tradeBsFlag == 'S') {
// 				toquote.sellVolume = quote.sellVolume + wbquote.volume
// 			} else {
// 				toquote.volume = quote.volume + wbquote.volume
// 			}
// 		}
// 	}

// 	if (quote.typeof == 'STOCKS') {
// 		if (toquote.price) toquote.marketCap = Math.round(toquote.price * quote.sharesOutstanding);
// 	}

// 	return toquote
// }





// // const KEEPS = [
// // 	'bid', 'bidSize',
// // 	'ask', 'askSize',
// // 	'open', 'close', 'preClose',
// // 	'volume',
// // 	'dealNum',
// // ] as KeysOf<Webull.Quote>

// // const KMAP = _.invert({
// // 	openPrice: ('open' as keyof Webull.Quote) as any,
// // 	closePrice: ('close' as keyof Webull.Quote) as any,
// // 	prevClose: ('preClose' as keyof Webull.Quote) as any,
// // 	dayHigh: ('high' as keyof Webull.Quote) as any,
// // 	dayLow: ('low' as keyof Webull.Quote) as any,
// // 	yearHigh: ('fiftyTwoWkHigh' as keyof Webull.Quote) as any,
// // 	yearLow: ('fiftyTwoWkLow' as keyof Webull.Quote) as any,
// // 	avgVolume: ('avgVolume' as keyof Webull.Quote) as any,
// // 	avgVolume10Day: ('avgVol10D' as keyof Webull.Quote) as any,
// // 	avgVolume3Month: ('avgVol3M' as keyof Webull.Quote) as any,
// // 	sharesOutstanding: ('totalShares' as keyof Webull.Quote) as any,
// // 	sharesFloat: ('outstandingShares' as keyof Webull.Quote) as any,
// // 	dealCount: ('dealNum' as keyof Webull.Quote) as any,
// // 	volume: ('volume' as keyof Webull.Quote) as any,
// // 	// bidPrice: ('bid' as keyof Webull.Quote) as any,
// // 	// bidSize: ('bidSize' as keyof Webull.Quote) as any,
// // 	// askPrice: ('ask' as keyof Webull.Quote) as any,
// // 	// askSize: ('askSize' as keyof Webull.Quote) as any,
// // 	// ____: ('____' as keyof Webull.Quote) as any,
// // } as Quote)
// // console.log('KMAP ->', KMAP)
// // Object.keys(KMAP).forEach(wkey => {
// // 	let qkey = KMAP[wkey]
// // 	let wbvalue = wbquote[wkey]
// // 	let value = quote[qkey]
// // 	if (!wbvalue || wbvalue == value) return;
// // 	quote[KMAP[key]] = wbvalue
// // })



// // export async function search(query: string) {
// // 	// return got.get('https://infoapi.webull.com/api/search/tickers3', {
// // 	// 	query: { keys: query },
// // 	// 	json: true,
// // 	// }).then(function({ body }) {
// // 	// 	return body
// // 	// })
// // }


