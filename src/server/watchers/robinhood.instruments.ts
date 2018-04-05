// 

import * as _ from 'lodash'
import * as pforever from 'p-forever'
import * as pevent from 'p-event'
import * as Rx from '../../common/rxjs'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import * as core from '../../common/core'
import radio from '../adapters/radio'
import clock from '../../common/clock'



export const ready = new Rx.ReadySubject()
radio.once('robinhood.instruments.ready', () => ready.next())



if (process.MASTER) {
	radio.ready.toPromise().then(function() {
		return readyInstruments()
	}).catch(function(error) {
		console.error('robinhood.instruments.ready Error ->', error)
	}).finally(function() {
		radio.emit('robinhood.instruments.ready')
	})
}



async function readyInstruments() {
	let coms = core.array.create(process.INSTANCES).map(function(i) {
		return ['exists', `${redis.RH.SYMBOLS}:${process.INSTANCES}:${i}`]
	})
	let resolved = await redis.main.pipeline(coms).exec().then(redis.fix) as number[]
	console.log('resolved ->', resolved)
	if (_.sum(resolved) == process.INSTANCES) return;
	return syncInstruments()
}



async function syncInstruments() {
	await pforever(function(url) {
		if (url) return getInstruments(url);
		return pforever.end
	}, 'https://api.robinhood.com/instruments/')
	console.warn('syncInstruments -> DONE')
}



async function getInstruments(url: string) {
	let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
	if (!response) return;
	response.results.forEach(function(instrument) {
		core.fix(instrument)
		instrument.mic = _.compact(instrument.market.split('/')).pop()
		instrument.acronym = robinhood.ACRONYMS[instrument.mic]
	})

}





// if (process.MASTER) {
// 	radio.ready.toPromise().then(function() {
// 		return pretry(readyInstruments, {
// 			max_tries: Infinity, max_interval: 10000,
// 		})
// 	})

// 	// .then(readyInstruments).catch(function(error) {
// 	// 	console.error('readyInstruments Error ->', error)
// 	// })
// }









// async function readyInstruments() {
// 	let symbols = await robinhood.getAllSymbols()
// 	if (symbols.length > 0) return;
// 	syncAllInstruments()
// }

// async function doForever() {
// 	await pforever(function(url) {
// 		if (url) return onUrl(url);
// 		return pforever.end
// 	}, 'https://api.robinhood.com/instruments/')
// }

// function syncInstruments() {
// 	return doForever().catch(function(error) {
// 		console.error('syncInstruments Error ->', error)
// 		return pevent(ticks, ticks.T5).then(syncInstruments)
// 	})
// }



// async function refreshInstruments() {
// 	// let response = await http.get('https://infoapi.webull.com/api/search/tickers2', {
// 	let response = await http.get('https://httpbin.org/range/1024', {
// 		// query: { keys: 'nvda' },
// 	}).catch(function(error) {
// 		console.error('refreshInstruments Error ->', error)
// 	})
// 	console.log('response ->', response)
// }

// // /**▶ 3:00 AM Weekdays */
// // const job = new cron.CronJob({
// // 	cronTime: '00 03 * * 1-5',
// // 	timeZone: 'America/New_York',
// // 	start: true,
// // 	onTick: refreshInstruments,
// // 	runOnInit: process.MASTER,
// // })





// function startRefresh() {
// 	return (async function refreshInstruments() {

// 	})().catch(function(error) {

// 	})
// 	// return refreshInstruments().catch
// }






