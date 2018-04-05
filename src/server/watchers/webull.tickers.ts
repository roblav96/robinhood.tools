// 

import * as _ from 'lodash'
import * as pAll from 'p-all'
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
	await pAll(symbols.map(v => () => getTicker(v)), { concurrency: 1 })

	console.info('syncTickers -> done')

}

async function getTicker(symbol: string) {
	let instrument = await redis.main.hgetall(`${redis.RH.INSTRUMENTS}:${symbol}`) as Robinhood.Instrument
	core.fix(instrument)
	console.log('instrument ->', console.inspect(instrument))

	let mic = _.compact(instrument.market.split('/')).pop()
	let acronym = robinhood.MICS[mic]

	let search = await http.get('https://infoapi.webull.com/api/search/tickers2', {
		query: { keys: instrument.simple_name || instrument.name },
	})
	console.log('search ->', console.inspect(search))

	await clock.pEvent('5s')

}

