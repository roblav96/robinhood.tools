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
	let resolved = await redis.main.pipecoms(coms) as number[]
	console.log('resolved ->', resolved)
	if (_.sum(resolved) == process.INSTANCES) return;
	return syncInstruments()
}



async function syncInstruments() {
	// if (DEVELOPMENT) await redis.main.purge(redis.RH.INSTRUMENTS);
	await pforever(function(url) {
		if (url) return getInstruments(url);
		return pforever.end
	}, 'https://api.robinhood.com/instruments/')
	console.warn('syncInstruments -> DONE')
}



async function getInstruments(url: string) {
	let instruments = await robinhood.getInstruments(url)

	console.log('instruments ->', console.inspect(instruments.results.slice(0, 3)))



	// let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
	// if (!response) return;

	// let coms = response.results.filter(function(v) {
	// 	return v.symbol.match(/\W+/) == null
	// }).map(function(v) {
	// 	core.fix(v)
	// 	return ['hmset', redis.RH.INSTRUMENTS + ':' + v.symbol, v as any]
	// })
	// await redis.main.pipecoms(coms)

	// return response.next

	// if (
	// 	instrument.state == 'active' &&
	// 	instrument.tradability == 'tradable' &&
	// 	instrument.tradeable == true
	// ) {
	// 	coms.push(['hmset', redis.RH.INSTRUMENTS + ':' + instrument.symbol, instrument as any])
	// } else {
	// 	coms.push(['del', redis.RH.INSTRUMENTS + ':' + instrument.symbol, instrument as any])
	// }

	// let instruments = response.results.filter(function(instrument) {
	// 	return !Array.isArray(instrument.symbol.match(/\W+/))
	// }).map(function(instrument) {
	// 	core.fix(instrument)
	// 	return instrument
	// })

	// // console.log('instruments ->', console.inspect(instruments))

	// // let coms = instruments.map(v => ['hmset', redis.RH.INSTRUMENTS + ':' + v.symbol, v as any])

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






