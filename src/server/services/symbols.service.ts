// 

import '../main'
import * as pAll from 'p-all'
import * as pForever from 'p-forever'
import * as schedule from 'node-schedule'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import * as utils from '../adapters/utils'
import * as webull from '../adapters/webull'
import * as yahoo from '../adapters/yahoo'
import * as iex from '../adapters/iex'
import * as quotes from '../adapters/quotes'
import radio from '../adapters/radio'



let ready = false
radio.on('symbols.ready', function() {
	if (ready) radio.emit('symbols.start');
})

async function start() {

	// await syncEverything(true)
	// await quotes.syncAllQuotes()

	let keys = [
		rkeys.RH.SYMBOLS, rkeys.WB.SYMBOLS,
		rkeys.SYMBOLS.STOCKS, rkeys.SYMBOLS.FOREX, rkeys.SYMBOLS.INDEXES,
	]
	let exists = await redis.main.coms(keys.map(k => ['exists', k])) as number[]
	if (_.sum(exists) != keys.length) await syncEverything();

	ready = true
	radio.emit('symbols.start')

} start().catch(error => console.error(`start Error ->`, error))



schedule.scheduleJob('55 3 * * 1-5', () => syncEverything(true))
async function syncEverything(resets = false) {
	await syncInstruments()
	await syncTickers()
	await syncStocks()
	await syncForex()
	await syncIndexes()
	await quotes.syncAllQuotes(resets)
}



async function syncInstruments() {
	if (process.env.DEVELOPMENT) console.log('syncInstruments start ->');
	await pForever(async function getInstruments(url) {
		let { results, next } = await http.get(url) as Robinhood.Api.Paginated<Robinhood.Instrument>
		results.remove(v => Array.isArray(v.symbol.match(utils.regxSymbol)))

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
	if (process.env.DEVELOPMENT) console.info('syncInstruments done ->');
}

async function syncTickers() {
	if (process.env.DEVELOPMENT) console.log('syncTickers start ->');

	let tickers = await Promise.all([
		// stocks
		http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/8', {
			query: { pageSize: 9999, hl: 'en' },
		}),
		// etfs
		http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/13', {
			query: { pageSize: 9999, hl: 'en' },
		}),
	]) as Webull.Ticker[]
	tickers = _.flatten(tickers)
	tickers.remove(v => Array.isArray(v.disSymbol.match(utils.regxSymbol)))
	tickers.forEach(v => {
		webull.fix(v)
		v.disSymbol = webull.fixSymbol(v.disSymbol)
	})

	if (process.env.DEVELOPMENT) console.log('webull valids ->');
	let tids = tickers.map(v => v.tickerId).filter(Number.isFinite)
	let chunks = core.array.chunks(tids, _.ceil(tids.length / 256))
	let valids = _.flatten(await pAll(chunks.map(chunk => {
		return () => http.get('https://quoteapi.webull.com/api/quote/tickerRealTimes', {
			query: { tickerIds: chunk.join(','), hl: 'en' },
		}) as Promise<Webull.Ticker[]>
	}), { concurrency: 2 })).map(v => v.tickerId)
	tickers.remove(v => !valids.includes(v.tickerId))

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
	let symbols = Object.keys(fsymbols)

	if (process.env.DEVELOPMENT) console.log('webull.syncTickersQuotes ->');
	await webull.syncTickersQuotes(fsymbols)

	if (process.env.DEVELOPMENT) console.log('yahoo.syncQuotes ->');
	await yahoo.syncQuotes(symbols)

	if (process.env.DEVELOPMENT) console.log('iex.syncItems ->');
	await iex.syncItems(symbols)

	if (process.env.DEVELOPMENT) console.info('syncTickers done ->', symbols.length);
}



async function syncStocks() {
	if (process.env.DEVELOPMENT) console.log('syncStocks start ->');
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
	if (process.env.DEVELOPMENT) console.log('syncForex start ->');
	let symbols = core.clone(webull.forex)
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

async function syncIndexes() {
	if (process.env.DEVELOPMENT) console.log('syncIndexes start ->');
	let symbols = core.clone(webull.indexes)
	let tickers = await pAll(symbols.map(symbol => {
		return () => getTicker(symbol, 1)
	}), { concurrency: 2 })
	let response = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/globalIndices/1') as Webull.Api.MarketIndex[]
	response.forEach(v => v.marketIndexList.forEach(vv => tickers.push(vv)))
	tickers.remove(v => !v || (v.secType && v.secType.includes(52)) || ['IBEX', 'STI'].includes(v.disSymbol))
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
	let response = await http.get('https://infoapi.webull.com/api/search/tickers3', {
		query: { keys: symbol, tickerType },
	}) as Webull.Api.Paginated<Webull.Ticker>
	if (!Array.isArray(response.list)) return;
	return response.list.find(v => v.disSymbol == symbol)
}


