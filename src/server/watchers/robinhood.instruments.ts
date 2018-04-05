// 

import * as _ from 'lodash'
import * as pforever from 'p-forever'
import * as pall from 'p-all'
import * as Rx from '../../common/rxjs'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import * as core from '../../common/core'
import radio from '../adapters/radio'



export const ready = new Rx.ReadySubject()
radio.once('robinhood.instruments.ready', () => ready.next())



if (process.MASTER) {
	radio.ready.toPromise().then(readyInstruments).catch(function(error) {
		console.error('ready Error ->', error)
	}).finally(function() {
		console.info('readyInstruments -> done')
		radio.emit('robinhood.instruments.ready')
	})
}



async function readyInstruments() {
	// if (DEVELOPMENT) await redis.main.purge(redis.RH.RH);

	// if (DEVELOPMENT) await redis.main.purge(redis.RH.INSTRUMENTS);
	let saved = await redis.main.keys(redis.RH.INSTRUMENTS + ':*')
	if (_.isEmpty(saved)) {
		await syncInstruments()
	}

	// if (DEVELOPMENT) { await redis.main.purge(redis.RH.TRADABLES); await redis.main.purge(redis.RH.UNTRADABLES); }
	let tradables = await redis.main.smembers(redis.RH.TRADABLES) as string[]
	if (_.isEmpty(tradables)) {
		await syncTradables()
	}

	// // if (DEVELOPMENT) await redis.main.purge(`${redis.RH.SYMBOLS}:${process.INSTANCES}`);
	// let coms = core.array.create(process.INSTANCES).map(function(i) {
	// 	return ['exists', `${redis.RH.SYMBOLS}:${process.INSTANCES}:${i}`]
	// })
	// let exists = await redis.main.pipecoms(coms) as number[]
	// if (_.sum(exists) != process.INSTANCES) {
	// 	await chunkSymbols()
	// }

}



async function syncInstruments() {
	await pforever(async function(url) {

		let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
		_.remove(response.results, v => v.symbol.match(/\W+/))
		if (DEVELOPMENT) console.log('syncInstruments ->', console.inspect(response.results.length));

		let coms = response.results.map(v => ['hmset', redis.RH.INSTRUMENTS + ':' + v.symbol, v as any])
		await redis.main.pipecoms(coms)
		return response.next || pforever.end

	}, 'https://api.robinhood.com/instruments/')

	console.info('syncInstruments -> done')
	radio.emit('syncInstruments')

}



async function syncTradables() {
	let rkeys = await redis.main.keys(redis.RH.INSTRUMENTS + ':*')
	await pall(rkeys.map(function (rkey) {
		return () => {}
	}))

	let tradable = new redis.SetsComs(redis.RH.TRADABLES)
	let untradable = new redis.SetsComs(redis.RH.UNTRADABLES)
	response.results.forEach(function(v) {
		let active = v.state == 'active' && v.tradability == 'tradable' && v.tradeable == true
		if (active) {
			tradable.sadd(v.symbol)
			untradable.srem(v.symbol)
		} else {
			tradable.srem(v.symbol)
			untradable.sadd(v.symbol)
		}
	})

	tradable.concat(coms)
	untradable.concat(coms)
}

async function chunkSymbols() {
	let symbols = (await redis.main.smembers(redis.RH.TRADABLES) as string[]).sort()

	let chunks = core.array.chunks(symbols, process.INSTANCES)
	let coms = chunks.map((v, i) => ['set', `${redis.RH.SYMBOLS}:${process.INSTANCES}:${i}`, v.toString()])
	await redis.main.pipecoms(coms)

	console.info('chunkSymbols -> done')
	radio.emit('chunkSymbols')

}




