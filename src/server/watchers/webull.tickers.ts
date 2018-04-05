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
import * as robinhoodinstruments from './robinhood.instruments'
import clock from '../../common/clock'
import radio from '../adapters/radio'



export const ready = new Rx.ReadySubject()
radio.once('webull.tickers.ready', () => ready.next())

ready.subscribe(function() { console.warn('ready.subscribe') })

if (process.MASTER) {
	let done = 0
	radio.on('webull.tickers.done', function() {
		done++
		if (done < process.INSTANCES) return;
		radio.off('webull.tickers.done')
		radio.emit('webull.tickers.ready')
	})
}
if (process.WORKER) {
	robinhoodinstruments.ready.toPromise().then(readyTickers).catch(function(error) {
		console.error('readyTickers Error ->', error)
	}).finally(function() {
		radio.emit('webull.tickers.done')
	})
}



async function readyTickers() {
	if (DEVELOPMENT) await redis.main.purge(redis.WB.WB);

	let synced = await redis.main.keys(`${redis.WB.TICKERS}:*`)
	console.log('tickers synced ->', console.inspect(synced.length))
	if (synced.length < 10000) {
		await syncTickers()
	}

	console.info('readyTickers -> done')

}



async function syncTickers() {
	let symbols = await robinhood.getSymbols()
	console.log('symbols.length ->', console.inspect(symbols.length))

	await pAll(symbols.map((v, i) => function() {
		let prog = core.number.round((i / symbols.length) * 100)
		console.log(console.inspect(prog), 'symbol ->', console.inspect(v))
		return syncTicker(v)
	}), { concurrency: 1 })
	// await syncTicker('AAIT')

	console.info('syncTickers -> done')

}

async function syncTicker(symbol: string) {
	// console.log('symbol ->', console.inspect(symbol), console.inspect(progress))

	let instrument = await redis.main.hgetall(`${redis.RH.INSTRUMENTS}:${symbol}`) as Robinhood.Instrument
	core.fix(instrument)
	// console.warn('instrument ->', console.inspect(_.pick(instrument, ['symbol', 'name', 'simple_name', 'good', 'country', 'acronym'] as KeysOf<Robinhood.Instrument>)))

	await clock.pEvent('250ms')
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
		if (instrument.good) {
			console.error('!result ->', console.inspect(instrument), 'response.list ->', console.inspect(response.list))
		}
		return
	}

	let ticker = _.omit(result, ['match']) as Webull.Ticker
	// console.log('ticker ->', console.inspect(_.pick(ticker, ['disSymbol', 'tickerName', 'tinyName', 'regionAlias', 'disExchangeCode'] as KeysOf<Webull.Ticker>)))
	await redis.main.hmset(`${redis.WB.TICKERS}:${symbol}`, ticker)

	// await clock.pEvent('250ms')

}





// radio.once('webull.tickers.ready', () => ready.next())

// if (process.MASTER) {
// 	robinhoodinstruments.ready.toPromise().then(readyTickers).catch(function(error) {
// 		console.error('readyTickers Error ->', error)
// 	}).finally(function() {
// 		radio.emit('webull.tickers.ready')
// 	})
// }

// async function syncTickers() {
// 	let stocks = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/8', {
// 		query: { pageIndex: 0, pageSize: 999999, hl: 'en', sourceRegionId: 1 },
// 	}) as Webull.Ticker[]
// 	await redis.main.coms(stocks.map(function(v) {
// 		return ['hmset', `${redis.WB.TICKERS}:${v.disSymbol}`, v as any]
// 	}))

// 	let etfs = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/6/cards/13', {
// 		query: { pageIndex: 0, pageSize: 999999, hl: 'en', sourceRegionId: 1 },
// 	}) as Webull.Ticker[]
// 	await redis.main.coms(etfs.map(function(v) {
// 		return ['hmset', `${redis.WB.TICKERS}:${v.disSymbol}`, v as any]
// 	}))

// 	console.info('syncTickers -> done')

// }


