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
		radio.emit('robinhood.instruments.ready')
	})
}



async function readyInstruments() {
	await redis.main.purge(redis.RH.INSTRUMENTS)
	let saved = await redis.main.keys(redis.RH.INSTRUMENTS + ':*')
	if (_.isEmpty(saved)) {
		await syncInstruments()
	}

	await redis.main.purge(`${redis.RH.SYMBOLS}:${process.INSTANCES}`)
	let coms = core.array.create(process.INSTANCES).map(function(i) {
		return ['exists', `${redis.RH.SYMBOLS}:${process.INSTANCES}:${i}`]
	})
	let exists = await redis.main.pipecoms(coms) as number[]
	if (_.sum(exists) != process.INSTANCES) {
		await syncSymbols()
	}
}



async function syncInstruments() {
	await pforever(async function(url) {
		let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
		_.remove(response.results, v => v.symbol.match(/\W+/))
		if (DEVELOPMENT) console.log('syncInstruments ->', console.inspect(response.results.length));

		let coms = [] as Redis.Coms
		let actives = new redis.SetsComs(redis.RH.ACTIVES)
		let inactives = new redis.SetsComs(redis.RH.INACTIVES)
		response.results.forEach(function(v) {
			coms.push(['hmset', redis.RH.INSTRUMENTS + ':' + v.symbol, v as any])
			let active = v.state == 'active' && v.tradability == 'tradable' && v.tradeable == true
			if (active) {
				actives.sadd(v.symbol)
				inactives.srem(v.symbol)
			} else {
				actives.srem(v.symbol)
				inactives.sadd(v.symbol)
			}
		})
		actives.concat(coms)
		inactives.concat(coms)

		await redis.main.pipecoms(coms)
		return response.next || pforever.end

	}, 'https://api.robinhood.com/instruments/')
	radio.emit('syncInstruments')
}



async function syncSymbols() {
	let symbols = (await redis.main.smembers(redis.RH.ACTIVES) as string[]).sort()
	let chunks = core.array.chunks(symbols, process.INSTANCES)
	let coms = chunks.map((v, i) => ['set', `${redis.RH.SYMBOLS}:${process.INSTANCES}:${i}`, v.toString()])
	await redis.main.pipecoms(coms)
	radio.emit('syncSymbols')
}




