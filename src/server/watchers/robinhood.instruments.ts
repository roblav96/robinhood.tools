// 

import * as _ from 'lodash'
import * as pretry from 'bluebird-retry'
import * as pforever from 'p-forever'
import * as boom from 'boom'
import * as Rx from '../../common/rxjs'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import * as radio from '../adapters/radio'
import * as core from '../../common/core'
import clock from '../../common/clock'



export const ready = new Rx.ReadySubject()

radio.ready.toPromise().then(async function() {
	if (process.MASTER) {
		await pretry(readyInstruments, { max_tries: Infinity })
	}
	radio

}).catch(function(error) {
	console.error('robinhood.instruments Error ->', error)
	ready.next()
})



if (process.MASTER) {
	radio.ready.toPromise().then(function() {
		return pretry(readyInstruments, {
			max_tries: Infinity, max_interval: 10000,
		})
	})

	// .then(readyInstruments).catch(function(error) {
	// 	console.error('readyInstruments Error ->', error)
	// })
}

async function readyInstruments() {
	let coms = core.array.create(process.INSTANCES).map(function(i) {
		return ['exists', `${redis.RH.SYMBOLS}:${process.INSTANCES}:${i}`]
	})
	let resolved = await redis.main.pipeline(coms).exec().then(redis.pipe) as number[]
	console.log('resolved ->', resolved)
	if (_.sum(resolved) == process.INSTANCES) return true;
	throw boom.tooManyRequests('now try again')

	// return pforever()
}

async function syncAllInstruments() {
	return pforever()
}









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






