// 

import * as pAll from 'p-all'
import * as pForever from 'p-forever'
import * as _ from '../../common/lodash'
import * as R from '../../common/rambdax'
import * as Rx from '../../common/rxjs'
import * as core from '../../common/core'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import clock from '../../common/clock'
import radio from '../adapters/radio'



export const rxready = new Rx.ReadySubject()
radio.once(`${__filename}.ready`, () => rxready.next())

if (process.PRIMARY) {
	radio.rxready.toPromise().then(readyInstruments).catch(function(error) {
		console.error('readyInstruments Error ->', error)
	}).finally(function() {
		radio.emit(`${__filename}.ready`)
	})
}



async function readyInstruments() {
	// if (DEVELOPMENT) await redis.main.purge(redis.RH.RH);
	if (DEVELOPMENT) await redis.main.purge(redis.WB.WB);

	let scard = await redis.main.scard(redis.RH.SYMBOLS)
	console.log(redis.RH.SYMBOLS, console.inspect(scard))
	if (scard < 10000) {
		await syncInstruments()
	}

	let hlen = await redis.main.hlen(redis.WB.TICKER_IDS)
	console.log(redis.WB.TICKER_IDS, console.inspect(hlen))
	if (hlen < 9000) {
		await syncTickerIds()
	}

	console.info('readyInstruments -> done')

}



async function syncInstruments() {
	await pForever(async function(url) {

		let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
		_.remove(response.results, v => Array.isArray(v.symbol.match(/\W+/)))

		if (DEVELOPMENT) {
			console.log('syncInstruments ->',
				console.inspect(response.results.length),
				console.inspect(response.next)
			)
		}

		// const BLACKLIST = ['ASPU', 'EQS', 'INSI', 'MUFG', 'YESR']

		let coms = [] as Redis.Coms
		let symbols = new redis.SetsComs(redis.RH.SYMBOLS)
		response.results.forEach(function(v) {
			// if (BLACKLIST.includes(v.symbol)) {
			// 	symbols.srem(v.symbol)
			// 	coms.push(['del', `${redis.RH.INSTRUMENTS}:${v.symbol}`])
			// 	return
			// }
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

	console.info('syncInstruments -> done')

}



async function syncTickerIds() {

	let tickers = _.flatten(await Promise.all([
		// stocks
		http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/8', {
			query: { pageSize: 999999 },
		}),
		// etfs
		http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/13', {
			query: { pageSize: 999999 },
		}),
		// etfs
		http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/14', {
			query: { pageSize: 999999 },
		}),
	])) as Webull.Ticker[]
	_.remove(tickers, v => Array.isArray(v.disSymbol.match(/\W+/)))

	await radio.emitAll(iSyncTickerIds, tickers)

	console.info('syncTickerIds -> done')

}



radio.onAll(iSyncTickerIds)
async function iSyncTickerIds(done: string, tickers: Webull.Ticker[]) {

	let symbols = core.array.chunks(await robinhood.getAllSymbols(), process.INSTANCES)[process.INSTANCE]
	console.log('iSyncTickerIds symbols.length ->', console.inspect(symbols.length))

	let disTickers = _.groupBy(tickers, 'disSymbol' as keyof Webull.Ticker) as Dict<Webull.Ticker[]>
	await pAll(symbols.map(symbol => {
		return () => syncTickerId(symbol, disTickers[symbol])
	}), { concurrency: 1 })

	console.info('iSyncTickerIds -> done')
	radio.iDone(done)

}

async function syncTickerId(symbol: string, tickers = [] as Webull.Ticker[]) {
	if (DEVELOPMENT) console.log('syncTickerId ->', console.inspect(symbol));

	let instrument = await redis.main.hgetall(`${redis.RH.INSTRUMENTS}:${symbol}`) as Robinhood.Instrument
	core.fix(instrument)
	// console.warn('instrument ->', console.inspect(_.pick(instrument, ['symbol', 'valid', 'name', 'simple_name', 'country', 'acronym'] as KeysOf<Robinhood.Instrument>)))

	// console.log('tickers ->', console.inspect(tickers))
	let ticker = tickers.find(v => v.disExchangeCode.indexOf(instrument.acronym) == 0 || v.regionIsoCode.indexOf(instrument.country) == 0)
	// if (ticker) console.info('ticker ->', console.inspect(_.pick(ticker, ['tickerId', 'disSymbol', 'tickerName', 'tinyName', 'disExchangeCode', 'regionIsoCode'] as KeysOf<Webull.Ticker>)));

	if (!ticker) {

		await clock.toPromise('250ms')
		let response = await http.get('https://infoapi.stocks666.com/api/search/tickers2', {
			query: { keys: symbol },
			retries: Infinity, tick: '3s',
		}) as Webull.API.Paginated<Webull.Ticker>

		if (!Array.isArray(response.list)) return;

		let tags = core.string.tags(instrument.simple_name || instrument.name)
		let results = response.list.filter(function(v) {
			return v && v.disSymbol.indexOf(symbol) == 0 && (v.tinyName || v.tickerName)
		}).map(function(v) {
			let match = _.intersection(tags, core.string.tags(v.tinyName || v.tickerName)).length
			return Object.assign(v, { match })
		})

		let result = results.find(v => v.match > 0 && v.disExchangeCode.indexOf(instrument.acronym) == 0 && v.regionAlias.indexOf(instrument.country) == 0)
		if (!result) result = results.find(v => v.match > 0 && v.disExchangeCode.indexOf(instrument.acronym) == 0);
		if (!result) result = results.find(v => v.disExchangeCode.indexOf(instrument.acronym) == 0);
		if (!result) result = results.find(v => v.match > 0);
		if (!result) result = results.find(v => results.length == 1);
		if (!result) result = results.find(v => (v.tickerName).indexOf(symbol) == 0);
		if (!result) {
			if (instrument.valid) {
				console.error(
					'!result ->', console.inspect(instrument),
					' \ntickers ->', console.inspect(tickers),
					' \nresponse.list ->', console.inspect(response.list)
				)
			}
			return
		}

		ticker = result
		// console.log('ticker ->', console.inspect(_.pick(ticker, ['tickerId', 'disSymbol', 'tickerName', 'tinyName', 'disExchangeCode', 'regionAlias'] as KeysOf<Webull.Ticker>)))

	}

	await redis.main.hset(redis.WB.TICKER_IDS, symbol, ticker.tickerId)

}



// async function chunkSymbols() {
// 	let rkeys = [redis.RH.SYMBOLS, redis.RH.VALID_SYMBOLS, redis.RH.INVALID_SYMBOLS]
// 	let rcoms = rkeys.map(v => ['smembers', v])
// 	let resolved = await redis.main.coms(rcoms) as string[][]

// 	let coms = [] as Redis.Coms
// 	resolved.forEach(function(symbols, i) {
// 		symbols.sort()
// 		let chunks = core.array.chunks(symbols, process.INSTANCES)
// 		chunks.forEach(function(chunk, ii) {
// 			coms.push(['set', `${rkeys[i]}:${process.INSTANCES}:${ii}`, chunk.toString()])
// 		})
// 	})
// 	await redis.main.coms(coms)

// }




