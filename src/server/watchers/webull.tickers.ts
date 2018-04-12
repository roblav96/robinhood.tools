// 

import * as path from 'path'
import * as pAll from 'p-all'
import * as pRetry from 'bluebird-retry'
import * as _ from '../../common/lodash'
import * as R from '../../common/rambdax'
import * as Rx from '../../common/rxjs'
import * as pretty from '../../common/pretty'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import * as core from '../../common/core'
import * as rhinstruments from './robinhood.instruments'
import clock from '../../common/clock'
import radio from '../adapters/radio'



export const rxready = new Rx.ReadySubject()
radio.once('webull.tickers.ready', () => rxready.next())

if (process.PRIMARY) {
	Promise.all([
		radio.rxready.toPromise(),
		rhinstruments.rxready.toPromise(),
	]).then(readyTickers).catch(function(error) {
		console.error('readyTickers Error ->', error)
	}).finally(function() {
		radio.emit('webull.tickers.ready')
	})
}



async function readyTickers() {
	if (DEVELOPMENT) await redis.main.purge(redis.WB.WB);

	let synced = await redis.main.hlen(redis.WB.TICKER_IDS)
	console.log('tickers synced ->', console.inspect(synced))
	if (synced < 9000) {
		await syncTickers()
	}

	// await chunkTickerIds()

	console.info('readyTickers -> done')

}



async function syncTickers() {

	let tickers = _.flatten(await Promise.all([
		// stocks
		http.get('https://securitiesapi.stocks666.com/api/securities/market/tabs/v2/6/cards/8', {
			query: { pageSize: 999999 },
		}),
		// etfs
		http.get('https://securitiesapi.stocks666.com/api/securities/market/tabs/v2/6/cards/13', {
			query: { pageSize: 999999 },
		}),
	])) as Webull.Ticker[]

	_.remove(tickers, v => Array.isArray(v.disSymbol.match(/\W+/)))
	let dictTickers = _.groupBy(tickers, 'disSymbol' as keyof Webull.Ticker)

	await radio.emitAll(AllSyncTickers, dictTickers)

	console.info('syncTickers -> done')

}

radio.onAll(AllSyncTickers)
function AllSyncTickers(done: string, dictTickers: Dict<Webull.Ticker[]>) {
	return Promise.resolve().then(async function() {
		// if (process.INSTANCE != 1) return radio.done(done);

		let symbols = await robinhood.getSymbols()
		await pAll(symbols.map(symbol => {
			return () => syncTicker(symbol, dictTickers[symbol])
		}), { concurrency: 1 })

		console.info('AllSyncTickers -> done')
		radio.done(done)

	})
}

async function syncTicker(symbol: string, tickers = [] as Webull.Ticker[]) {
	// console.warn('syncTicker symbol ->', console.inspect(symbol))
	let start = Date.now()

	let instrument = await redis.main.hgetall(`${redis.RH.INSTRUMENTS}:${symbol}`) as Robinhood.Instrument
	core.fix(instrument)
	// console.warn('instrument ->', console.inspect(_.pick(instrument, ['symbol', 'valid', 'name', 'simple_name', 'country', 'acronym'] as KeysOf<Robinhood.Instrument>)))

	// console.log('tickers ->', console.inspect(tickers))
	// let ticker = tickers.find(v => v.disExchangeCode == instrument.acronym && v.regionIsoCode == instrument.country)
	let ticker = tickers.find(v => v.disExchangeCode.indexOf(instrument.acronym) == 0 || v.regionIsoCode.indexOf(instrument.country) == 0)
	// if (ticker) console.info('ticker ->', console.inspect(_.pick(ticker, ['tickerId', 'disSymbol', 'tickerName', 'tinyName', 'disExchangeCode', 'regionIsoCode'] as KeysOf<Webull.Ticker>)));

	if (!ticker) {

		let badcoms = [
			['del', `${redis.WB.TICKERS}:${symbol}`],
			['hdel', redis.WB.TICKER_IDS, symbol],
			['hdel', redis.WB.VALID_TICKER_IDS, symbol],
			['hdel', redis.WB.INVALID_TICKER_IDS, symbol],
		] as Redis.Coms

		if (['ASPU', 'EQS'].includes(symbol)) {
			return redis.main.coms(badcoms)
		}

		await clock.toPromise('250ms')
		let response = await http.get('https://infoapi.stocks666.com/api/search/tickers2', {
			query: { keys: symbol },
		}) as Webull.API.Paginated<Webull.Ticker>

		if (!Array.isArray(response.list)) {
			return redis.main.coms(badcoms)
		}

		let tags = core.string.tags(instrument.simple_name || instrument.name)
		let results = response.list.filter(function(v) {
			return v && v.disSymbol.indexOf(symbol) == 0
		}).map(function(v) {
			return Object.assign(v, {
				match: _.intersection(tags, core.string.tags(v.tinyName || v.tickerName)).length,
			})
		})

		let result = results.find(v => v.match > 0 && v.disExchangeCode.indexOf(instrument.acronym) == 0 && v.regionAlias == instrument.country)
		if (!result) result = results.find(v => v.match > 0 && v.disExchangeCode.indexOf(instrument.acronym) == 0);
		if (!result) result = results.find(v => v.disExchangeCode.indexOf(instrument.acronym) == 0);
		if (!result) result = results.find(v => v.match > 0);
		if (!result) result = results.find(v => results.length == 1);
		if (!result) result = results.find(v => (v.tinyName || v.tickerName).indexOf(symbol) == 0);
		if (!result) {
			if (instrument.valid) {
				console.error(
					'!result ->', console.inspect(instrument),
					'\ntickers ->', console.inspect(tickers),
					'\nresponse.list ->', console.inspect(response.list)
				)
			}
			return redis.main.coms(badcoms)
		}

		ticker = _.omit(result, ['match'])
		// console.log('ticker ->', console.inspect(_.pick(ticker, ['tickerId', 'disSymbol', 'tickerName', 'tinyName', 'disExchangeCode', 'regionAlias'] as KeysOf<Webull.Ticker>)))

	}

	let coms = [
		['hmset', `${redis.WB.TICKERS}:${symbol}`, ticker as any],
		['hset', redis.WB.TICKER_IDS, symbol, ticker.tickerId],
	] as Redis.Coms
	if (instrument.valid) {
		coms.push(['hset', redis.WB.VALID_TICKER_IDS, symbol, ticker.tickerId as any])
		coms.push(['hdel', redis.WB.INVALID_TICKER_IDS, symbol])
	} else {
		coms.push(['hset', redis.WB.INVALID_TICKER_IDS, symbol, ticker.tickerId as any])
		coms.push(['hdel', redis.WB.VALID_TICKER_IDS, symbol])
	}

	await redis.main.coms(coms)
	// console.warn('syncTicker', pretty.ms(Date.now() - start), 'symbol ->', console.inspect(symbol))
	console.log(pretty.ms(Date.now() - start), 'syncTicker symbol ->', console.inspect(symbol))

	// await clock.toPromise('10s')

}



// async function chunkTickerIds() {
// 	let rkeys = [redis.WB.TICKER_IDS, redis.WB.VALID_TICKER_IDS, redis.WB.INVALID_TICKER_IDS]
// 	let rcoms = rkeys.map(v => ['hgetall', v])
// 	let resolved = await redis.main.coms(rcoms) as Dict<string>[]

// 	let coms = [] as Redis.Coms
// 	resolved.forEach(function(dictIds, i) {
// 		let symbols = Object.keys(dictIds).sort()
// 		let chunks = core.array.chunks(symbols, process.INSTANCES)
// 		chunks.forEach(function(chunk, ii) {
// 			coms.push(['set', `${rkeys[i]}:${process.INSTANCES}:${ii}`, chunk.toString()])
// 		})
// 	})
// 	await redis.main.coms(coms)

// }




