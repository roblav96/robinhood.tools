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
	radio.ready.toPromise().then(readyInstruments).catch(function(error) {
		console.error('ready Error ->', error)
	}).finally(function() {
		console.warn('radio.emit -> robinhood.instruments.ready')
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
	// await saveInstruments()
	await chunkSymbols()
}



async function saveInstruments() {
	// await purgeInstruments()
	await pforever(async function(url) {
		let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
		_.remove(response.results, v => v.symbol.match(/\W+/))
		if (DEVELOPMENT) console.log('saveInstruments ->', console.inspect(response.results.length));
		let coms = response.results.map(v => ['hmset', redis.RH.INSTRUMENTS + ':' + v.symbol, v as any])
		await redis.main.pipecoms(coms)
		return response.next || pforever.end
	}, 'https://api.robinhood.com/instruments/')
}



async function chunkSymbols() {
	let symbols = (await redis.main.keys(redis.RH.INSTRUMENTS + ':*')).map(function(v) {
		return v.substring(v.lastIndexOf(':') + 1)
	})
	console.log('symbols ->', symbols)
}



async function purgeInstruments() {
	let purged = await redis.main.purge(redis.RH.INSTRUMENTS)
	console.warn('purgeInstruments ->', purged.length)
}




