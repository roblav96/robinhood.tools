// 

import * as pAll from 'p-all'
import * as _ from '../../common/lodash'
import * as R from '../../common/rambdax'
import * as Rx from '../../common/rxjs'
import * as core from '../../common/core'
import * as pretty from '../../common/pretty'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
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
	// if (DEVELOPMENT) await redis.main.purge(redis.WB.WB);

	let synced = await redis.main.hlen(redis.WB.TICKER_IDS)
	console.log('tickers synced ->', console.inspect(synced))
	if (synced < 9000) {
		await syncTickers()
	}

	await chunkTickerIds()

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
	let disTickers = _.groupBy(tickers, 'disSymbol' as keyof Webull.Ticker)

	await radio.emitAll(AllSyncTickers, disTickers)

	console.info('syncTickers -> done')

}

async function AllSyncTickers(done: string, disTickers: Dict<Webull.Ticker[]>) {

	let symbols = await robinhood.getSymbols()
	await pAll(symbols.map(symbol => {
		return () => syncTicker(symbol, disTickers[symbol])
	}), { concurrency: 1 })

	console.info('AllSyncTickers -> done')
	radio.done(done)

}
radio.onAll(AllSyncTickers)



async function syncTicker(symbol: string, tickers = [] as Webull.Ticker[]) {
	if (DEVELOPMENT) console.log('syncTicker ->', console.inspect(symbol));

	let instrument = await redis.main.hgetall(`${redis.RH.INSTRUMENTS}:${symbol}`) as Robinhood.Instrument
	core.fix(instrument)
	// console.warn('instrument ->', console.inspect(_.pick(instrument, ['symbol', 'valid', 'name', 'simple_name', 'country', 'acronym'] as KeysOf<Robinhood.Instrument>)))

	// console.log('tickers ->', console.inspect(tickers))
	let ticker = tickers.find(v => v.disExchangeCode.indexOf(instrument.acronym) == 0 || v.regionIsoCode.indexOf(instrument.country) == 0)
	// if (ticker) console.info('ticker ->', console.inspect(_.pick(ticker, ['tickerId', 'disSymbol', 'tickerName', 'tinyName', 'disExchangeCode', 'regionIsoCode'] as KeysOf<Webull.Ticker>)));

	if (!ticker) {

		if (['ASPU', 'EQS', 'INSI', 'MUFG', 'YESR'].includes(symbol)) return;

		await clock.toPromise('250ms')
		let response = await http.get('https://infoapi.stocks666.com/api/search/tickers2', {
			query: { keys: symbol },
			retries: Infinity, tick: '1s',
		}) as Webull.API.Paginated<Webull.Ticker>

		if (!Array.isArray(response.list)) return;

		let tags = core.string.tags(instrument.simple_name || instrument.name)
		let results = response.list.filter(function(v) {
			return v && v.disSymbol.indexOf(symbol) == 0
		}).map(function(v) {
			return Object.assign(v, {
				match: _.intersection(tags, core.string.tags(v.tinyName || v.tickerName)).length,
			})
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
					'\ntickers ->', console.inspect(tickers),
					'\nresponse.list ->', console.inspect(response.list)
				)
			}
			return
		}

		ticker = result
		// console.log('ticker ->', console.inspect(_.pick(ticker, ['tickerId', 'disSymbol', 'tickerName', 'tinyName', 'disExchangeCode', 'regionAlias'] as KeysOf<Webull.Ticker>)))

	}

	await redis.main.hset(redis.WB.TICKER_IDS, symbol, ticker.tickerId)

}



async function chunkTickerIds() {
	let alls = core.array.create(process.INSTANCES)

	let rcoms = alls.map(function(i) {
		return ['get', `${redis.RH.SYMBOLS}:${process.INSTANCES}:${i}`]
	})
	rcoms.push(['hgetall', redis.WB.TICKER_IDS])
	let resolved = await redis.main.coms(rcoms) as string[]
	let tickerIds = (resolved.pop() as any) as Dict<string>

	let coms = [] as Redis.Coms
	resolved.forEach(function(v, i) {
		let symbols = v.split(',')
		console.log('symbols.length ->', symbols.length)
		// let symbols = Object.keys(dictIds).sort()
		// let chunks = core.array.chunks(symbols, process.INSTANCES)
		// chunks.forEach(function(chunk, ii) {
		// 	coms.push(['set', `${rkeys[i]}:${process.INSTANCES}:${ii}`, chunk.toString()])
		// })
	})
	await redis.main.coms(coms)

}




