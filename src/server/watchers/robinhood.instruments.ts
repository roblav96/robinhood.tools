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
		console.info('readyInstruments -> done')
		radio.emit('robinhood.instruments.ready')
	})
}



async function readyInstruments() {
	// if (DEVELOPMENT) await redis.main.purge(redis.RH.RH);

	// if (DEVELOPMENT) await redis.main.purge(redis.RH.INSTRUMENTS);
	let saved = await redis.main.keys(redis.RH.INSTRUMENTS + ':*')
	let tradable = await redis.main.smembers(redis.RH.TRADABLE)
	if (_.isEmpty(saved) || _.isEmpty(tradable)) {
		await saveInstruments()
	}

	// if (DEVELOPMENT) await redis.main.purge(`${redis.RH.SYMBOLS}:${process.INSTANCES}`);
	let coms = core.array.create(process.INSTANCES).map(function(i) {
		return ['exists', `${redis.RH.SYMBOLS}:${process.INSTANCES}:${i}`]
	})
	let exists = await redis.main.pipecoms(coms) as number[]
	if (_.sum(exists) != process.INSTANCES) {
		await chunkSymbols()
	}

}



async function saveInstruments() {
	await pforever(async function(url) {

		let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
		_.remove(response.results, v => v.symbol.match(/\W+/))
		if (DEVELOPMENT) console.log('saveInstruments ->', console.inspect(response.results.length));

		let tradable = new redis.SetsComs(redis.RH.TRADABLE)
		let untradable = new redis.SetsComs(redis.RH.UNTRADABLE)
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

		let coms = response.results.map(v => ['hmset', redis.RH.INSTRUMENTS + ':' + v.symbol, v as any])
		tradable.concat(coms)
		untradable.concat(coms)

		await redis.main.pipecoms(coms)
		return response.next || pforever.end

	}, 'https://api.robinhood.com/instruments/')

	console.info('saveInstruments -> done')
	radio.emit('saveInstruments')

}



async function chunkSymbols() {
	let symbols = (await redis.main.smembers(redis.RH.TRADABLE) as string[]).sort()

	let chunks = core.array.chunks(symbols, process.INSTANCES)
	let coms = chunks.map((v, i) => ['set', `${redis.RH.SYMBOLS}:${process.INSTANCES}:${i}`, v.toString()])
	await redis.main.pipecoms(coms)

	console.info('chunkSymbols -> done')
	radio.emit('chunkSymbols')

}




