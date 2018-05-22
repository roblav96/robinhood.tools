// 

import '../main'
import * as pAll from 'p-all'
import * as pForever from 'p-forever'
import * as schedule from 'node-schedule'
import * as _ from '../../common/lodash'
import * as Rx from '../../common/rxjs'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import * as utils from '../adapters/utils'
import * as webull from '../adapters/webull'
import * as yahoo from '../adapters/yahoo'
import * as iex from '../adapters/iex'
import clock from '../../common/clock'



let ready = false
pandora.on('symbols.start', function(hubmsg) {
	if (ready) pandora.broadcast({}, 'symbols.ready');
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
	pandora.broadcast({}, 'symbols.ready')

} start().catch(error => console.error('start Error ->', error))



schedule.scheduleJob('50 3 * * 1-5', async function sync() {
	await syncInstruments()
	await syncTickers()
})

schedule.scheduleJob('00 4 * * 1-5', async function reset() {
	await syncStocks()
	pandora.broadcast({}, 'symbols.reset')
})



async function syncInstruments() {
	await pForever(async function getInstruments(url) {
		let { results, next } = await http.get(url) as Robinhood.Api.Paginated<Robinhood.Instrument>
		results.remove(v => Array.isArray(v.symbol.match(utils.symbolFilter)))

		if (process.env.DEVELOPMENT) console.log('getInstruments ->', results.length, next);

		let coms = [] as Redis.Coms
		let dids = {} as Dict<string>
		let scoms = new redis.SetsComs(rkeys.RH.SYMBOLS)
		results.forEach(function(v) {
			dids[v.id] = v.symbol
			scoms.sadd(v.symbol)
			v.mic = _.compact(v.market.split('/')).pop()
			v.acronym = robinhood.MICS[v.mic]
			v.alive = v.state == 'active' && v.tradability == 'tradable' && v.tradeable == true
			coms.push(['hmset', `${rkeys.RH.INSTRUMENTS}:${v.symbol}`, v as any])
		})
		coms.push(['hmset', rkeys.RH.IDS, dids as any])
		scoms.merge(coms)
		await redis.main.coms(coms)

		return next || pForever.end

	}, 'https://api.robinhood.com/instruments/')
}

async function syncTickers() {
	if (process.env.DEVELOPMENT) console.info('syncTickers start ->')
	let tickers = await Promise.all([
		// stocks
		http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/8', {
			query: { pageSize: 9999 }
		}),
		// etfs
		http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/13', {
			query: { pageSize: 9999 }
		}),
	]) as Webull.Ticker[]
	tickers = _.flatten(tickers)
	tickers.remove(v => Array.isArray(v.disSymbol.match(utils.symbolFilter)))
	tickers.forEach(core.fix)
	tickers.forEach(v => {
		if (!v.disSymbol.includes('-')) return;
		let split = v.disSymbol.split('-')
		let start = split.shift()
		let end = split.pop()
		let middle = end.length == 1 ? '.' : '-'
		v.disSymbol = start + middle + end.slice(-1)
	})

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
	let symbols = Object.keys(fsymbols)
	let yhquotes = await yahoo.getQuotes(symbols)
	await redis.main.coms(yhquotes.map(v => ['hmset', `${rkeys.YH.QUOTES}:${v.symbol}`, v as any]))
	await iex.sync(symbols)
	if (process.env.DEVELOPMENT) console.info('syncTickers done ->', symbols.length);
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
	let response = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/globalIndices/1') as Webull.Api.MarketIndex[]
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


