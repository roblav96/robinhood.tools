// 

import * as _ from 'lodash'
import * as pAll from 'p-all'
import * as fuzzy from 'fuzzysort'
import * as boom from 'boom'
import * as Rx from '../../common/rxjs'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import * as core from '../../common/core'
import * as rhinstruments from './robinhood.instruments'
import clock from '../../common/clock'
import radio from '../adapters/radio'



export const ready = new Rx.ReadySubject()

if (process.WORKER) {
	rhinstruments.ready.toPromise().then(readyTickers).catch(function(error) {
		console.error('readyTickers Error ->', error)
	}).finally(function() {
		ready.next()
	})
}



async function readyTickers() {
	let symbols = await robinhood.getSymbols()
	console.log('symbols.length ->', console.inspect(symbols.length))

	await syncTickers(symbols)

	console.info('readyTickers -> done')

}



async function syncTickers(symbols: string[]) {
	await pAll(symbols.map(v => () => syncTicker(v)), { concurrency: 1 })
	// await syncTicker('AAIT')

	console.info('syncTickers -> done')

}

async function syncTicker(symbol: string) {
	let instrument = await redis.main.hgetall(`${redis.RH.INSTRUMENTS}:${symbol}`) as Robinhood.Instrument
	core.fix(instrument)
	console.warn('instrument ->', console.inspect(_.pick(instrument, ['symbol', 'name', 'simple_name', 'alive', 'country', 'acronym'] as KeysOf<Robinhood.Instrument>)))

	await clock.pEvent('1s')
	let response = await http.get('https://infoapi.webull.com/api/search/tickers2', {
		query: { keys: symbol },
	}) as Webull.API.Paginated<Webull.Ticker>
	if (!Array.isArray(response.list)) return;

	let tags = core.string.tags(instrument.name)
	let results = response.list.filter(function(v) {
		return v && v.disSymbol.indexOf(symbol) == 0
	}).map(function(v) {
		return Object.assign(v, {
			match: _.intersection(tags, core.string.tags(v.tickerName)).length,
		})
	})

	let result = results.find(v => v.match > 0 && v.disExchangeCode.indexOf(instrument.acronym) == 0 && v.regionAlias == instrument.country)
	if (!result) result = results.find(v => v.match > 0 && v.disExchangeCode.indexOf(instrument.acronym) == 0);
	if (!result) result = results.find(v => v.disExchangeCode.indexOf(instrument.acronym) == 0);
	if (!result) result = results.find(v => v.match > 0);
	if (!result) result = results.find(v => v.disSymbol == symbol && results.length == 1);
	if (!result) {
		if (instrument.alive) {
			console.error('!result ->', console.inspect(instrument))
			console.log('response.list ->', console.inspect(response.list))
			// throw new Error(instrument.symbol)
		}
		return
	}

	let ticker = _.omit(result, ['match']) as Webull.Ticker
	console.log('ticker ->', console.inspect(_.pick(ticker, ['disSymbol', 'tickerName', 'tinyName', 'regionAlias', 'disExchangeCode'] as KeysOf<Webull.Ticker>)))
	await redis.main.hmset(`${redis.WB.TICKERS}:${symbol}`, ticker)

}


