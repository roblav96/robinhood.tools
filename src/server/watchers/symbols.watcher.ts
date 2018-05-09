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
import * as utils from '../adapters/utils'
import * as webull from '../adapters/webull'
import clock from '../../common/clock'



pandora.on('readySymbols', _.debounce(async function readySymbols(hubmsg: Pandora.HubMessage<Symbols.OnSymbolsData>) {
	// let type = hubmsg.data.type

	// if (type == 'STOCKS') {
	// await redis.main.del(rkeys.WB.TICKER_IDS)
	let tids = await redis.main.hlen(rkeys.WB.TICKER_IDS)
	if (tids < 10000) await syncStocks();
	// await redis.main.del(rkeys.SYMBOLS.STOCKS)
	let stocks = await redis.main.exists(rkeys.SYMBOLS.STOCKS)
	if (stocks == 0) await chunkStocks();
	// }

	// if (type == 'FOREX') {
	// await redis.main.del(rkeys.SYMBOLS.FOREX)
	let forex = await redis.main.exists(rkeys.SYMBOLS.FOREX)
	if (forex == 0) await syncForex();
	// }

	// if (type == 'INDEXES') {
	// await redis.main.del(rkeys.SYMBOLS.INDEXES)
	let indexes = await redis.main.exists(rkeys.SYMBOLS.INDEXES)
	if (indexes == 0) await syncIndexes(webull.indexes);
	// }

	pandora.broadcast({}, 'onSymbols', { ready: true } as Symbols.OnSymbolsData)

}, 1000, { leading: false, trailing: true }))



schedule.scheduleJob('50 3 * * 1-5', syncStocks)
async function syncStocks() {
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
	tickers.remove(v => Array.isArray(v.disSymbol.match(/[^A-Z-]/)))
	let dtickers = _.groupBy(tickers, 'disSymbol' as keyof Webull.Ticker) as Dict<Webull.Ticker[]>

	await pForever(async url => {

		let response = await http.get(url) as Robinhood.Api.Paginated<Robinhood.Instrument>
		response.results.remove(v => Array.isArray(v.symbol.match(/[^A-Z-]/)))

		if (process.env.DEVELOPMENT) {
			console.log('syncStocks ->', response.results.length, response.next)
		}

		let coms = [] as Redis.Coms
		response.results.forEach(v => {
			v.mic = _.compact(v.market.split('/')).pop()
			v.acronym = robinhood.MICS[v.mic]
			v.alive = v.state == 'active' && v.tradability == 'tradable' && v.tradeable == true
			coms.push(['hmset', `${rkeys.RH.INSTRUMENTS}:${v.symbol}`, v as any])
		})
		await redis.main.coms(coms)

		await pAll(response.results.map(v => {
			return () => syncTickerId(v, dtickers[v.symbol])
		}), { concurrency: 2 })

		return response.next || pForever.end

	}, 'https://api.robinhood.com/instruments/')
}

async function syncTickerId(instrument: Robinhood.Instrument, tickers = [] as Webull.Ticker[]) {
	// console.log('tickers ->', tickers)
	let ticker = tickers.find(v => v.disExchangeCode.indexOf(instrument.acronym) == 0 || v.regionIsoCode.indexOf(instrument.country) == 0)
	if (process.env.DEVELOPMENT && ticker) console.info('ticker ->', instrument.symbol);
	// if (ticker) console.info('ticker ->', console.inspect(_.pick(ticker, ['tickerId', 'disSymbol', 'tickerName', 'tinyName', 'disExchangeCode', 'regionIsoCode'] as KeysOf<Webull.Ticker>)));

	if (!ticker) {
		if (process.env.DEVELOPMENT) console.log('ticker ->', instrument.symbol);

		let tickerType: number
		if (instrument.type == 'stock') tickerType = 2;
		if (instrument.type == 'etp') tickerType = 3;

		let response = await http.get('https://infoapi.webull.com/api/search/tickers2', {
			query: { keys: instrument.symbol, tickerType }
		}) as Webull.Api.Paginated<Webull.Ticker>

		if (!Array.isArray(response.list)) return;

		let tags = core.string.tags(instrument.simple_name || instrument.name)
		let results = response.list.filter(function(v) {
			return v && v.disSymbol.indexOf(instrument.symbol) == 0 && Number.isFinite(v.tickerId) && (v.tinyName || v.tickerName)
		}).map(function(v) {
			let match = _.intersection(tags, core.string.tags(v.tinyName || v.tickerName)).length
			return Object.assign(v, { match })
		})

		let result = results.find(v => v.match > 0 && v.disExchangeCode.indexOf(instrument.acronym) == 0 && v.regionAlias.indexOf(instrument.country) == 0)
		if (!result) result = results.find(v => v.match > 0 && v.disExchangeCode.indexOf(instrument.acronym) == 0);
		if (!result) result = results.find(v => v.disExchangeCode.indexOf(instrument.acronym) == 0);
		if (!result) result = results.find(v => v.match > 0);
		if (!result) result = results.find(v => results.length == 1);
		if (!result) result = results.find(v => v.tickerName.includes(instrument.symbol));

		if (result) {
			ticker = result
			// console.log('ticker ->', console.inspect(_.pick(ticker, ['tickerId', 'disSymbol', 'tickerName', 'tinyName', 'disExchangeCode', 'regionAlias'] as KeysOf<Webull.Ticker>)))
		} else {
			ticker = tickers[0] || response.list[0]
		}

		if (!ticker) {
			console.error('!ticker ->', instrument, 'tickers ->', tickers, 'response.list ->', response.list)
			return
		}

	}

	await redis.main.hset(rkeys.WB.TICKER_IDS, instrument.symbol, ticker.tickerId)

}

schedule.scheduleJob('00 4 * * 1-5', () => chunkStocks(true))
async function chunkStocks(reset = false) {
	let tdict = await redis.main.hgetall(rkeys.WB.TICKER_IDS) as Dict<number>
	tdict = _.mapValues(tdict, v => Number.parseInt(v as any))
	let tpairs = _.uniqWith(_.toPairs(tdict), (a, b) => a[1] == b[1]).sort()
	let coms = [
		['set', rkeys.SYMBOLS.STOCKS, JSON.stringify(tpairs.map(v => v[0]))],
		['set', rkeys.FSYMBOLS.STOCKS, JSON.stringify(_.fromPairs(tpairs))],
	] as Redis.Coms
	await webull.syncTickersQuotes(_.fromPairs(tpairs))
	let chunks = core.array.chunks(tpairs, +process.env.CPUS)
	chunks.forEach(function(chunk, i) {
		let symbols = JSON.stringify(chunk.map(v => v[0]))
		coms.push(['set', `${rkeys.SYMBOLS.STOCKS}:${process.env.CPUS}:${i}`, symbols])
		let fpairs = JSON.stringify(_.fromPairs(chunk))
		coms.push(['set', `${rkeys.FSYMBOLS.STOCKS}:${process.env.CPUS}:${i}`, fpairs])
	})
	await redis.main.coms(coms)
	if (reset) {
		pandora.broadcast({
			processName: 'stocks',
		}, 'onSymbols', { reset, type: 'STOCKS' } as Symbols.OnSymbolsData);
	}
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
}

async function finishSync(type: keyof typeof rkeys.SYMBOLS, tickers: Webull.Ticker[]) {
	tickers = _.orderBy(tickers, 'disSymbol')
	let fsymbols = {} as Dict<number>
	tickers.forEach(v => fsymbols[v.disSymbol] = v.tickerId)
	await webull.syncTickersQuotes(fsymbols)
	await redis.main.coms([
		['set', rkeys.SYMBOLS[type], JSON.stringify(Object.keys(fsymbols))],
		['set', rkeys.FSYMBOLS[type], JSON.stringify(fsymbols)],
	])
}

async function getTicker(symbol: string, tickerType: number) {
	let response = await http.get('https://infoapi.webull.com/api/search/tickers2', {
		query: { keys: symbol, tickerType },
	}) as Webull.Api.Paginated<Webull.Ticker>
	if (!Array.isArray(response.list)) return;
	return response.list.find(v => v.disSymbol == symbol)
}



declare global {
	namespace Symbols {
		interface OnSymbolsData {
			type: keyof typeof rkeys.SYMBOLS
			ready: boolean
			reset: boolean
		}
	}
}


