// 

export * from '../../common/webull'
import * as pAll from 'p-all'
import * as boom from 'boom'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as webull from '../../common/webull'
import * as redis from './redis'
import * as http from './http'



export function fix(quote: Partial<Webull.Ticker & Webull.Quote>) {
	if (quote.faStatus) quote.faStatus = webull.ticker_status[quote.faStatus];
	if (quote.status) quote.status = webull.ticker_status[quote.status];

	if (quote.faTradeTime) quote.faTradeTime = new Date(quote.faTradeTime).valueOf();
	if (quote.mktradeTime) quote.mktradeTime = new Date(quote.mktradeTime).valueOf();
	if (quote.tradeTime) quote.tradeTime = new Date(quote.tradeTime).valueOf();

	Object.keys(quote).forEach(key => {
		let value = quote[key]
		if (core.string.is(value) && !isNaN(value as any)) {
			quote[key] = Number.parseFloat(value)
		}
	})

	let bakeys = ['bid', 'ask']
	bakeys.forEach(key => {
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



export async function syncTickersQuotes(fsymbols: Dict<number>, type: keyof typeof rkeys.SYMBOLS) {
	let inverse = _.invert(fsymbols)
	let tickerIds = Object.values(fsymbols)
	let chunks = core.array.chunks(tickerIds, _.ceil(tickerIds.length / 256))
	await pAll(chunks.map(chunk => {
		return () => Promise.all([
			http.get('https://securitiesapi.webull.com/api/securities/ticker/v2', {
				query: { tickerIds: chunk.join(','), hl: 'en' },
			}),
			http.get('https://quoteapi.webull.com/api/quote/tickerRealTimes/full', {
				query: { tickerIds: chunk.join(','), hl: 'en' }, wbauth: true,
			}),
		]).then(function(resolved: any[][]) {
			let coms = []
			resolved.forEach((items, i) => {
				items.forEach(item => {
					core.fix(item)
					fix(item)
					item.symbol = inverse[item.tickerId]
					if (i == 0) coms.push(['hmset', `${rkeys.WB.TICKERS}:${item.symbol}`, item]);
					if (i == 1) {
						item.typeof = type
						coms.push(['hmset', `${rkeys.WB.QUOTES}:${item.symbol}`, item])
					}
				})
			})
			return redis.main.coms(coms)
		})
	}), { concurrency: 2 })
}





// let tickerIds = '950051966,913256090,913255488,913254927,913255608,913254260,913254182,913256686,913324523,913254792,913254978,913324027,913253762,913324399,916040772,913324514,913324301,913257299,913255149,950052409,913323338,913324390,913254390,913255176,913253370,913256804,925242751,913323187,925418535,913254971,913322705,925376835,925377479,913915038,913323410,913303834,913254694,913303689,925353477,913323716,913322688,913256359,913255420,925334931,925353486,913255035,925344562,925198113,913324312,913323011,925173523,913255305,913254968,913256779,913254250,913257208,913255269,913253637,913255102,913323367,913323953,913255036,913324097,913324328,913323553,913255661,913303667,913254159,913243767,913243162,913287011,913286964,913246271,913246726,913286952,913286806,913244171,925186034,913243433,913286915,925414612,925376600,913287006,913247324,913245280,913243395,913293825,913286884,913243679,913286540,913243892,913286862,913243053,913243170,913243391,913247526,925310971,913244627,913245453,913247355,913247442'
// let tickerIds = '925334567,925353501,913255891,913254439,913254221,913324608,913255367,913256016,913254466,913255758,913254361,913433744,913254998,913324520,913255496,913303904,913255858,913324513,913256260,916040686,913254861,913303686,913324218,913324402,913255862,913915444,913254855,913324092,913324507,925242751,913254962,913324243,913324714,925353513,913431416,913323223,913257186,913254297,913323064,925408913,925353512,913323075,913323486,913324490,913323047,913256831,913324337,913256567,950052411,913324387,916040749,913905421,925310518,913255702,913254566,913254303,913255770,913303773,913254902,913255378,913255166,913255036,913254704,913303707,913253601,913324212,913253574,925293327,913287009,913247357,913244629,913243621,913286763,913247504,913243416,913247638,913243495,913243835,913286663,925414602,925351809,913286869,913247346,913245116,913243348,913247171,913286610,913243912,913245601,913247211,925415824,913243486,925411763,913244877,913247218,913244512,913247597,913243260,913243264'
// pAll(tickerIds.split(',').map(tid => {
// 	return () => http.get('https://quoteapi.webull.com/api/quote/tickerRealTimes/full', {
// 		query: { tickerIds: tid, hl: 'en' }, wbauth: true,
// 	}).catch(function(error) {
// 		console.warn(`error tid ->`, tid)
// 		console.error(`Error -> %O`, error)
// 	})
// }))





// async function getItems(fsymbols: Dict<number>, url: string, wbauth = false) {
// 	let inverse = _.invert(fsymbols)
// 	let tickerIds = Object.values(fsymbols)
// 	if (tickerIds.length > 128) {
// 		console.error(`getItems tickerIds > 128`)
// 		return []
// 	}
// 	return http.get(url, {
// 		query: { tickerIds: tickerIds.join(','), hl: 'en' }, wbauth,
// 	}).then((items: any[]) => {
// 		items.forEach(item => {
// 			core.fix(item)
// 			fix(item)
// 			item.symbol = inverse[item.tickerId]
// 		})
// 		return items
// 	})
// }

// export function getFullQuotes(fsymbols: Dict<number>): Promise<Webull.Quote[]> {
// 	return getItems(fsymbols, 'https://quoteapi.webull.com/api/quote/tickerRealTimes/full', true)
// }

// export function getTickers(fsymbols: Dict<number>): Promise<Webull.Ticker[]> {
// 	return getItems(fsymbols, 'https://securitiesapi.webull.com/api/securities/ticker/v2')
// }

// export async function syncTickersQuotes(fsymbols: Dict<number>) {
// 	let coms = [] as Redis.Coms
// 	let wbquotes = await getFullQuotes(fsymbols)
// 	wbquotes.forEach(function(v) {
// 		let rkey = `${rkeys.WB.QUOTES}:${v.symbol}`
// 		coms.push(['hmset', rkey, v as any])
// 	})
// 	let wbtickers = await getTickers(fsymbols)
// 	wbtickers.forEach(function(v) {
// 		let rkey = `${rkeys.WB.TICKERS}:${v.symbol}`
// 		coms.push(['hmset', rkey, v as any])
// 	})
// 	await redis.main.coms(coms)
// }



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


