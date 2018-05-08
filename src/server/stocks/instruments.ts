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
import clock from '../../common/clock'



schedule.scheduleJob('55 3 * * 1-5', async function() {
	await syncInstruments()
	pandora.broadcast({}, 'onSymbols', { reset: true })
})

readyInstruments().catch(function(error) {
	console.error('readyInstruments Error ->', error)
})

async function readyInstruments() {
	// if (DEVELOPMENT) await redis.main.purge(rkeys.RH.RH);
	// if (DEVELOPMENT) await redis.main.purge(rkeys.WB.WB);
	let scard = await redis.main.scard(rkeys.RH.SYMBOLS)
	let hlen = await redis.main.hlen(rkeys.WB.TICKER_IDS)
	let exists = await redis.main.exists(`${rkeys.STOCKS.SYMBOLS}:${process.env.CPUS}:${process.env.INSTANCE}`) as number
	if (scard < 10000 || hlen < 10000 || exists != 1) {
		await syncInstruments()
		pandora.broadcast({}, 'onSymbols')
	}
}



async function chunkSymbols() {

	let tdict = await redis.main.hgetall(rkeys.WB.TICKER_IDS) as Dict<number>
	tdict = _.mapValues(tdict, v => Number.parseInt(v as any))
	let tpairs = _.toPairs(tdict).sort()

	let coms = [
		['set', rkeys.STOCKS.SYMBOLS, JSON.stringify(tpairs.map(v => v[0]))],
		['set', rkeys.STOCKS.FSYMBOLS, JSON.stringify(_.fromPairs(tpairs))],
	] as Redis.Coms

	let chunks = core.array.chunks(tpairs, +process.env.CPUS)
	chunks.forEach(function(chunk, i) {
		let symbols = JSON.stringify(chunk.map(v => v[0]))
		coms.push(['set', `${rkeys.STOCKS.SYMBOLS}:${process.env.CPUS}:${i}`, symbols])
		let fpairs = JSON.stringify(_.fromPairs(chunk))
		coms.push(['set', `${rkeys.STOCKS.FSYMBOLS}:${process.env.CPUS}:${i}`, fpairs])
	})
	await redis.main.coms(coms as any)

	// if (process.env.DEVELOPMENT) console.info('chunkSymbols -> done');

}



async function syncInstruments() {
	await pForever(async function(url) {

		let response = await http.get(url) as Robinhood.Api.Paginated<Robinhood.Instrument>
		_.remove(response.results, v => Array.isArray(v.symbol.match(/[^A-Z-]/)))

		if (process.env.DEVELOPMENT) {
			console.log('syncInstruments ->', response.results.length, response.next)
		}

		let coms = [] as Redis.Coms
		let symbols = new redis.SetsComs(rkeys.RH.SYMBOLS)
		response.results.forEach(function(v) {
			symbols.sadd(v.symbol)
			v.mic = _.compact(v.market.split('/')).pop()
			v.acronym = robinhood.MICS[v.mic]
			v.alive = v.state == 'active' && v.tradability == 'tradable' && v.tradeable == true
			coms.push(['hmset', `${rkeys.RH.INSTRUMENTS}:${v.symbol}`, v as any])
		})
		symbols.merge(coms)
		await redis.main.coms(coms)
		return response.next || pForever.end

	}, 'https://api.robinhood.com/instruments/')

	await syncTickerIds()

	await chunkSymbols()

	// if (process.env.DEVELOPMENT) console.info('syncInstruments -> done');

}



async function syncTickerIds() {

	let tickers = _.flatten(await Promise.all([
		// stocks
		http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/8', {
			query: { pageSize: 999999 }
		}),
		// etfs
		http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/13', {
			query: { pageSize: 999999 }
		}),
		// // funds
		// http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/14', {
		// 	query: { pageSize: 999999 }
		// }),
	])) as Webull.Ticker[]
	_.remove(tickers, v => Array.isArray(v.disSymbol.match(/[^A-Z-]/)))

	let disTickers = _.groupBy(tickers, 'disSymbol' as keyof Webull.Ticker) as Dict<Webull.Ticker[]>
	let symbols = (await redis.main.smembers(`${rkeys.RH.SYMBOLS}`) as string[]).sort()
	await pAll(symbols.map(symbol => {
		return () => syncTickerId(symbol, disTickers[symbol])
	}), { concurrency: 1 })

	if (process.env.DEVELOPMENT) console.info('syncTickerIds -> done');

}

async function syncTickerId(symbol: string, tickers = [] as Webull.Ticker[]) {
	// if (DEVELOPMENT) console.log('syncTickerId ->', symbol);

	let instrument = await redis.main.hgetall(`${rkeys.RH.INSTRUMENTS}:${symbol}`) as Robinhood.Instrument
	core.fix(instrument)
	// console.warn('instrument ->', _.pick(instrument, ['symbol', 'valid', 'name', 'simple_name', 'country', 'acronym'] as KeysOf<Robinhood.Instrument>))

	// console.log('tickers ->', console.inspect(tickers))
	let ticker = tickers.find(v => v.disExchangeCode.indexOf(instrument.acronym) == 0 || v.regionIsoCode.indexOf(instrument.country) == 0)
	if (process.env.DEVELOPMENT && ticker) console.info('ticker ->', symbol);
	// if (ticker) console.info('ticker ->', console.inspect(_.pick(ticker, ['tickerId', 'disSymbol', 'tickerName', 'tinyName', 'disExchangeCode', 'regionIsoCode'] as KeysOf<Webull.Ticker>)));

	if (!ticker) {
		if (process.env.DEVELOPMENT) console.log('ticker ->', symbol);

		let tickerType: number
		if (instrument.type == 'stock') tickerType = 2;
		if (instrument.type == 'etp') tickerType = 3;

		// await clock.toPromise('250ms')
		// console.time('search/tickers2')
		let response = await http.get('https://infoapi.webull.com/api/search/tickers2', {
			query: { keys: symbol, tickerType }
		}) as Webull.Api.Paginated<Webull.Ticker>
		// console.timeEnd('search/tickers2')

		if (!Array.isArray(response.list)) return;

		let tags = core.string.tags(instrument.simple_name || instrument.name)
		let results = response.list.filter(function(v) {
			return v && v.disSymbol.indexOf(symbol) == 0 && Number.isFinite(v.tickerId) && (v.tinyName || v.tickerName)
		}).map(function(v) {
			let match = _.intersection(tags, core.string.tags(v.tinyName || v.tickerName)).length
			return Object.assign(v, { match })
		})

		let result = results.find(v => v.match > 0 && v.disExchangeCode.indexOf(instrument.acronym) == 0 && v.regionAlias.indexOf(instrument.country) == 0)
		if (!result) result = results.find(v => v.match > 0 && v.disExchangeCode.indexOf(instrument.acronym) == 0);
		if (!result) result = results.find(v => v.disExchangeCode.indexOf(instrument.acronym) == 0);
		if (!result) result = results.find(v => v.match > 0);
		if (!result) result = results.find(v => results.length == 1);
		if (!result) result = results.find(v => v.tickerName.includes(symbol));

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

	await redis.main.hset(rkeys.WB.TICKER_IDS, symbol, ticker.tickerId)

}





// export default class {
// 	start() {
// 		console.log('start')
// 	}
// 	stop() {
// 		console.log('stop')
// 		return true
// 	}
// }





