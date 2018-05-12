// 

import '../main'
import * as pAll from 'p-all'
import * as pForever from 'p-forever'
import * as schedule from 'node-schedule'
import * as _ from '../../common/lodash'
import * as Rx from '../../common/rxjs'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import * as pandora from '../adapters/pandora'
import * as webull from '../adapters/webull'
import clock from '../../common/clock'



let ready = false
pandora.on('readySymbols', function(hubmsg) {
	if (ready) pandora.broadcast({}, 'symbolsReady');
})

async function start() {

	// await redis.main.del(rkeys.RH.SYMBOLS)
	let instruments = await redis.main.exists(rkeys.RH.SYMBOLS)
	if (instruments == 0) await syncInstruments();

	// await redis.main.del(rkeys.WB.SYMBOLS)
	let tickers = await redis.main.exists(rkeys.WB.SYMBOLS)
	if (tickers == 0) await syncTickers();

	// await redis.main.del(rkeys.SYMBOLS.STOCKS)
	let stocks = await redis.main.exists(rkeys.SYMBOLS.STOCKS)
	if (stocks == 0) await syncStocks();

	// await redis.main.del(rkeys.SYMBOLS.FOREX)
	let forex = await redis.main.exists(rkeys.SYMBOLS.FOREX)
	if (forex == 0) await syncForex();

	// await redis.main.del(rkeys.SYMBOLS.INDEXES)
	let indexes = await redis.main.exists(rkeys.SYMBOLS.INDEXES)
	if (indexes == 0) await syncIndexes(webull.indexes);

	ready = true
	pandora.broadcast({}, 'symbolsReady')

} start().catch(error => console.error('start Error ->', error))



schedule.scheduleJob('55 3 * * 1-5', async function sync() {
	await syncInstruments()
	await syncTickers()
})

schedule.scheduleJob('00 4 * * 1-5', async function reset() {
	await syncStocks()
	pandora.broadcast({}, 'symbols', { reset: true, type: 'STOCKS' } as SymbolsHubData)
})
declare global { interface SymbolsHubData { type: keyof typeof rkeys.SYMBOLS, reset: boolean } }



async function syncInstruments() {
	await pForever(async function getInstruments(url) {
		let { results, next } = await http.get(url) as Robinhood.Api.Paginated<Robinhood.Instrument>
		results.remove(v => Array.isArray(v.symbol.match(/[^A-Z-]/)))

		if (process.env.DEVELOPMENT) console.log('getInstruments ->', results.length, next);

		let coms = [] as Redis.Coms
		let scoms = new redis.SetsComs(rkeys.RH.SYMBOLS)
		results.forEach(function(v) {
			scoms.sadd(v.symbol)
			v.mic = _.compact(v.market.split('/')).pop()
			v.acronym = robinhood.MICS[v.mic]
			v.alive = v.state == 'active' && v.tradability == 'tradable' && v.tradeable == true
			coms.push(['hmset', `${rkeys.RH.INSTRUMENTS}:${v.symbol}`, v as any])
		})
		scoms.merge(coms)
		await redis.main.coms(coms)

		return next || pForever.end

	}, 'https://api.robinhood.com/instruments/')
}

async function syncTickers() {
	let tickers = await Promise.all([
		// stocks
		http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/8', {
			query: { pageSize: 9999, sourceRegionId: 1, hl: 'en' }
		}),
		// etfs
		http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/13', {
			query: { pageSize: 9999, sourceRegionId: 1, hl: 'en' }
		}),
	]) as Webull.Ticker[]
	tickers = _.flatten(tickers)
	tickers.remove(v => Array.isArray(v.disSymbol.match(/[^A-Z-]/)))
	tickers.forEach(core.fix)

	let coms = [] as Redis.Coms
	let scoms = new redis.SetsComs(rkeys.WB.SYMBOLS)
	let fsymbols = {} as Dict<number>
	let dtickers = _.groupBy(tickers, 'disSymbol' as keyof Webull.Ticker) as Dict<Webull.Ticker[]>
	Object.keys(dtickers).map(function(symbol) {
		scoms.sadd(symbol)
		if (dtickers[symbol].length > 1) dtickers[symbol].sort((a, b) => b.exchangeId - a.exchangeId).splice(1);
		let ticker = dtickers[symbol][0]
		fsymbols[symbol] = ticker.tickerId
		coms.push(['hmset', `${rkeys.WB.TICKERS}:${symbol}`, ticker as any])
	})
	coms.push(['hmset', rkeys.WB.TIDS, fsymbols as any])
	scoms.merge(coms)
	await redis.main.coms(coms)
	await webull.syncTickersQuotes(fsymbols)
	if (process.env.DEVELOPMENT) console.info('syncTickers done ->', Object.keys(fsymbols).length);
}



async function syncStocks() {
	let symbols = await redis.main.smembers(rkeys.WB.SYMBOLS) as string[]
	let tids = await redis.main.hgetall(rkeys.WB.TIDS) as Dict<number>
	tids = _.mapValues(tids, v => Number.parseInt(v as any))
	let pairs = _.toPairs(tids).filter(v => symbols.includes(v[0])).sort()
	let fsymbols = _.fromPairs(pairs)
	let coms = [
		['set', rkeys.SYMBOLS.STOCKS, JSON.stringify(Object.keys(fsymbols))],
		['set', rkeys.FSYMBOLS.STOCKS, JSON.stringify(fsymbols)],
	] as Redis.Coms
	let chunks = core.array.chunks(pairs, +process.env.CPUS)
	chunks.forEach(function(chunk, i) {
		let symbols = JSON.stringify(chunk.map(v => v[0]))
		coms.push(['set', `${rkeys.SYMBOLS.STOCKS}:${process.env.CPUS}:${i}`, symbols])
		let fpairs = JSON.stringify(_.fromPairs(chunk))
		coms.push(['set', `${rkeys.FSYMBOLS.STOCKS}:${process.env.CPUS}:${i}`, fpairs])
	})
	await redis.main.coms(coms)
	if (process.env.DEVELOPMENT) console.info('syncStocks done ->', Object.keys(fsymbols).length);
}

async function syncForex() {
	let symbols = ['BTCUSD', 'XAUUSD', 'XAGUSD']
	webull.fiats.forEach(v => webull.fiats.forEach(vv => {
		if (v == vv) return;
		symbols.push(v + vv)
	}))
	let tickers = await pAll(symbols.map(symbol => {
		return () => getTicker(symbol, 6)
	}), { concurrency: 2 })
	tickers.remove(v => !v)
	await finishSync('FOREX', tickers)
	if (process.env.DEVELOPMENT) console.info('syncForex done ->', tickers.length);
}

async function syncIndexes(indexes: string[]) {
	let symbols = core.clone(indexes)
	let tickers = await pAll(symbols.map(symbol => {
		return () => getTicker(symbol, 1)
	}), { concurrency: 2 })
	let response = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/globalIndices/1', {
		query: { hl: 'en' },
	}) as Webull.Api.MarketIndex[]
	response.forEach(v => v.marketIndexList.forEach(vv => tickers.push(vv)))
	tickers.remove(v => !v || (v.secType && v.secType.includes(52)) || v.disSymbol == 'IBEX')
	await finishSync('INDEXES', tickers)
	if (process.env.DEVELOPMENT) console.info('syncIndexes done ->', tickers.length);
}

async function finishSync(type: keyof typeof rkeys.SYMBOLS, tickers: Webull.Ticker[]) {
	tickers = _.orderBy(tickers, 'disSymbol')
	let fsymbols = {} as Dict<number>
	tickers.forEach(v => fsymbols[v.disSymbol] = v.tickerId)
	await redis.main.coms([
		['hmset', rkeys.WB.TIDS, fsymbols as any],
		['set', rkeys.SYMBOLS[type], JSON.stringify(Object.keys(fsymbols))],
		['set', rkeys.FSYMBOLS[type], JSON.stringify(fsymbols)],
	])
	await webull.syncTickersQuotes(fsymbols)
}

async function getTicker(symbol: string, tickerType: number) {
	let response = await http.get('https://infoapi.webull.com/api/search/tickers2', {
		query: { keys: symbol, tickerType },
	}) as Webull.Api.Paginated<Webull.Ticker>
	if (!Array.isArray(response.list)) return;
	return response.list.find(v => v.disSymbol == symbol)
}











// async function syncTickerId(instrument: Robinhood.Instrument, tickers = [] as Webull.Ticker[]) {
// 	// console.log('tickers ->', tickers)
// 	let ticker = tickers.find(v => v.disExchangeCode.indexOf(instrument.acronym) == 0 || v.regionIsoCode.indexOf(instrument.country) == 0)
// 	if (process.env.DEVELOPMENT && ticker) console.info('ticker ->', instrument.symbol);
// 	// if (ticker) console.info('ticker ->', console.inspect(_.pick(ticker, ['tickerId', 'disSymbol', 'tickerName', 'tinyName', 'disExchangeCode', 'regionIsoCode'] as KeysOf<Webull.Ticker>)));

// 	if (!ticker) {
// 		if (process.env.DEVELOPMENT) console.log('ticker ->', instrument.symbol);

// 		let tickerType: number
// 		if (instrument.type == 'stock') tickerType = 2;
// 		if (instrument.type == 'etp') tickerType = 3;

// 		let response = await http.get('https://infoapi.webull.com/api/search/tickers2', {
// 			query: { keys: instrument.symbol, tickerType }
// 		}) as Webull.Api.Paginated<Webull.Ticker>

// 		if (!Array.isArray(response.list)) return;

// 		let tags = core.string.tags(instrument.simple_name || instrument.name)
// 		let results = response.list.filter(function(v) {
// 			return v && v.disSymbol.indexOf(instrument.symbol) == 0 && Number.isFinite(v.tickerId) && (v.tinyName || v.tickerName)
// 		}).map(function(v) {
// 			let match = _.intersection(tags, core.string.tags(v.tinyName || v.tickerName)).length
// 			return Object.assign(v, { match })
// 		})

// 		let result = results.find(v => v.match > 0 && v.disExchangeCode.indexOf(instrument.acronym) == 0 && v.regionAlias.indexOf(instrument.country) == 0)
// 		if (!result) result = results.find(v => v.match > 0 && v.disExchangeCode.indexOf(instrument.acronym) == 0);
// 		if (!result) result = results.find(v => v.disExchangeCode.indexOf(instrument.acronym) == 0);
// 		if (!result) result = results.find(v => v.match > 0);
// 		if (!result) result = results.find(v => results.length == 1);
// 		if (!result) result = results.find(v => v.tickerName.includes(instrument.symbol));

// 		if (result) {
// 			ticker = result
// 			// console.log('ticker ->', console.inspect(_.pick(ticker, ['tickerId', 'disSymbol', 'tickerName', 'tinyName', 'disExchangeCode', 'regionAlias'] as KeysOf<Webull.Ticker>)))
// 		} else {
// 			ticker = tickers[0] || response.list[0]
// 		}

// 		if (!ticker) {
// 			console.error('!ticker ->', instrument, 'tickers ->', tickers, 'response.list ->', response.list)
// 			return
// 		}

// 	}

// 	await redis.main.hset(rkeys.WB.TICKER_IDS, instrument.symbol, ticker.tickerId)

// }


