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
radio.once('_robinhood.instruments.ready_', () => ready.next())

ready.subscribe(function() {
	console.warn('robinhood.instruments.ready')
})



if (process.MASTER) {
	radio.ready.toPromise().then(readyInstruments).catch(function(error) {
		console.error('ready Error ->', error)
	}).finally(function() {
		radio.emit('_robinhood.instruments.ready_')
	})
}



async function readyInstruments() {
	await redis.main.purge(redis.RH.INSTRUMENTS)
	let saved = await redis.main.keys(redis.RH.INSTRUMENTS + ':*')
	if (_.isEmpty(saved)) {
		await saveInstruments()
	}
	let coms = core.array.create(process.INSTANCES).map(function(i) {
		return ['exists', `${redis.RH.SYMBOLS}:${process.INSTANCES}:${i}`]
	})
	let resolved = await redis.main.pipecoms(coms) as number[]
	if (_.sum(resolved) != process.INSTANCES) {
		await chunkSymbols()
	}
}



async function saveInstruments() {
	await pforever(async function(url) {
		let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
		_.remove(response.results, v => v.symbol.match(/\W+/))
		if (DEVELOPMENT) console.log('saveInstruments ->', console.inspect(response.results.length));

		let coms = response.results.map(v => ['hmset', redis.RH.INSTRUMENTS + ':' + v.symbol, v as any])
		let scoms = new redis.SetsComs(redis.RH.ACTIVES)
		response.results.forEach(function(v) {
			let active = v.state == 'active' && v.tradability == 'tradable' && v.tradeable == true
			active ? scoms.sadd(v.symbol) : scoms.srem(v.symbol)
		})
		scoms.merge(coms)
		await redis.main.pipecoms(coms)

		return response.next || pforever.end

	}, 'https://api.robinhood.com/instruments/')
}



async function chunkSymbols() {
	let symbols = (await redis.main.keys(redis.RH.INSTRUMENTS + ':*')).map(function(v) {
		return v.substring(v.lastIndexOf(':') + 1)
	}).sort()
	let chunks = core.array.chunks(symbols, process.INSTANCES)
	let coms = chunks.map((v, i) => ['set', `${redis.RH.SYMBOLS}:${process.INSTANCES}:${i}`, v.toString()])
	await redis.main.pipecoms(coms)
}




