// 

import * as pAll from 'p-all'
import * as pForever from 'p-forever'
import * as path from 'path'
import * as _ from '../../common/lodash'
import * as R from '../../common/rambdax'
import * as Rx from '../../common/rxjs'
import * as core from '../../common/core'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import * as utils from '../services/utils'
import clock from '../../common/clock'
import radio from '../adapters/radio'



export const rxready = new Rx.ReadySubject()
const __fname = path.basename(__filename)
radio.once(`${__fname}.ready`, () => rxready.next())

if (process.PRIMARY) {
	radio.rxready.toPromise().then(readyInstruments).catch(function(error) {
		console.error('readyInstruments Error ->', error)
	}).finally(function() {
		radio.emit(`${__fname}.ready`)
	})
}



async function readyInstruments() {
	// if (DEVELOPMENT) await redis.main.purge(redis.RH.RH);
	// if (DEVELOPMENT) await redis.main.purge(redis.WB.WB);

	let scard = await redis.main.scard(redis.RH.SYMBOLS)
	console.log(redis.RH.SYMBOLS, scard)
	if (scard < 10000) {
		await syncInstruments()
	}

	let hlen = await redis.main.hlen(redis.WB.TICKER_IDS)
	console.log(redis.WB.TICKER_IDS, hlen)
	if (hlen < 10000) {
		await syncTickerIds()
	}

	await chunkSymbols()

	console.info('readyInstruments -> done')

}



async function chunkSymbols() {

	let tickerIds = await redis.main.hgetall(redis.WB.TICKER_IDS)
	let tpairs = _.toPairs(tickerIds).sort()
	let chunks = core.array.chunks(tpairs, process.INSTANCES)

	let coms = chunks.map(function(chunk, i) {
		chunk.forEach(v => v[1] = Number.parseInt(v[1] as any))
		let fpairs = JSON.stringify(_.fromPairs(chunk))
		return ['set', `${redis.SYMBOLS.STOCKS}:${process.INSTANCES}:${i}`, fpairs]
	})
	await redis.main.coms(coms as any)

}



async function syncInstruments() {
	await pForever(async function(url) {

		let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
		// _.remove(response.results, v => Array.isArray(v.symbol.match(/\W+/)))

		if (DEVELOPMENT) {
			console.log('syncInstruments ->', response.results.length, response.next)
		}

		let coms = [] as Redis.Coms
		let symbols = new redis.SetsComs(redis.RH.SYMBOLS)
		response.results.forEach(function(v) {
			symbols.sadd(v.symbol)
			v.mic = _.compact(v.market.split('/')).pop()
			v.acronym = robinhood.MICS[v.mic]
			v.valid = v.state == 'active' && v.tradability == 'tradable' && v.tradeable == true
			coms.push(['hmset', `${redis.RH.INSTRUMENTS}:${v.symbol}`, v as any])
		})
		symbols.merge(coms)

		await redis.main.coms(coms)
		return response.next || pForever.end

	}, 'https://api.robinhood.com/instruments/')

	await syncTickerIds()

	await chunkSymbols()

	// console.info('syncInstruments -> done')

}



async function syncTickerIds() {

	let proms = [
		// stocks
		http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/8', {
			query: { pageSize: 999999 }
		}),
		// etfs
		http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/13', {
			query: { pageSize: 999999 }
		})
	]

	if (PRODUCTION) {
		// funds
		proms.push(http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/14', {
			query: { pageSize: 999999 }
		}))
	}

	let tickers = _.flatten(await Promise.all(proms)) as Webull.Ticker[]
	// _.remove(tickers, v => Array.isArray(v.disSymbol.match(/\W+/)))

	await radio.emitAll(onSyncTickerIds, tickers)

	// console.info('syncTickerIds -> done')

}



radio.onAll(onSyncTickerIds)
async function onSyncTickerIds(done: string, tickers: Webull.Ticker[]) {

	let symbols = core.array.chunks(await robinhood.getAllSymbols(), process.INSTANCES)[process.INSTANCE]
	console.log('onSyncTickerIds symbols.length ->', symbols.length)

	let disTickers = _.groupBy(tickers, 'disSymbol' as keyof Webull.Ticker) as Dict<Webull.Ticker[]>
	await pAll(symbols.map(symbol => {
		return () => syncTickerId(symbol, disTickers[symbol])
	}), { concurrency: 1 })

	// console.info('onSyncTickerIds -> done')
	radio.donePrimary(done)

}

async function syncTickerId(symbol: string, tickers = [] as Webull.Ticker[]) {
	// if (DEVELOPMENT) console.log('syncTickerId ->', symbol);

	let instrument = await redis.main.hgetall(`${redis.RH.INSTRUMENTS}:${symbol}`) as Robinhood.Instrument
	core.fix(instrument)
	// console.warn('instrument ->', _.pick(instrument, ['symbol', 'valid', 'name', 'simple_name', 'country', 'acronym'] as KeysOf<Robinhood.Instrument>))

	// console.log('tickers ->', console.inspect(tickers))
	let ticker = tickers.find(v => v.disExchangeCode.indexOf(instrument.acronym) == 0 || v.regionIsoCode.indexOf(instrument.country) == 0)
	if (DEVELOPMENT && ticker) console.info('ticker ->', symbol);
	// if (ticker) console.info('ticker ->', console.inspect(_.pick(ticker, ['tickerId', 'disSymbol', 'tickerName', 'tinyName', 'disExchangeCode', 'regionIsoCode'] as KeysOf<Webull.Ticker>)));

	if (!ticker) {
		if (DEVELOPMENT) console.log('!ticker ->', symbol);

		let tickerType: number
		if (instrument.type == 'stock') tickerType = 2;
		if (instrument.type == 'etp') tickerType = 3;

		await clock.toPromise('100ms')
		// console.time('search/tickers2')
		let response = await http.get('https://infoapi.stocks666.com/api/search/tickers2', {
			query: { keys: symbol, tickerType }
		}) as Webull.API.Paginated<Webull.Ticker>
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

	await redis.main.hset(redis.WB.TICKER_IDS, symbol, ticker.tickerId)

}




