// 

import * as Rx from '../../common/rxjs'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import clock from '../../common/clock'
import radio from '../adapters/radio'



if (process.MASTER) {

	radio.ready.subscribe(readyInstruments)
	async function readyInstruments() {
		let symbols = await robinhood.getSymbols()
		if (symbols.length > 0) return;
		syncAllInstruments()
	}

	async function syncAllInstruments() {

	}


	console.log('clock ->', console.dump(clock, { depth: 8 }))

	function first(i) { }
	clock.on('1s', first)
	function second(i) { }
	clock.on('2s', second)
	function third(i) { }
	clock.on('1s', third)

	clock.eachEvent(function(event, i) {
		console.log('i ->', i, 'event ->', event)
	})

	// console.log('clock.ee ->', clock.ee)
	// clock.offAll()
	// console.log('clock.ee ->', clock.ee)

	console.log('clock ->', console.dump(clock, { depth: 8 }))

}









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






