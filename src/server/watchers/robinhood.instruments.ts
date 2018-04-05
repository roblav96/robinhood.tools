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
		console.error('readyInstruments Error ->', error)
	}).finally(function() {
		radio.emit('robinhood.instruments.ready')
	})
} else {
	ready.toPromise().then(readyWebullTickerIds).catch(function(error) {
		console.error('readyWebullTickerIds Error ->', error)
	})
}



async function readyInstruments() {
	// if (DEVELOPMENT) await redis.main.purge(redis.RH.RH);

	// if (DEVELOPMENT) await redis.main.purge(redis.RH.INSTRUMENTS);
	let resolved = await redis.main.pipecoms([
		['keys', redis.RH.INSTRUMENTS + ':*'],
		['exists', redis.RH.SYMBOLS],
		['exists', redis.RH.TRADABLES],
		['exists', redis.RH.UNTRADABLES],
	])
	if (_.compact(resolved).length != resolved.length) {
		await syncInstruments()
	}

	// if (DEVELOPMENT) await redis.main.purge(`${redis.RH.TRADABLES}:${process.INSTANCES}`);
	// let coms = core.array.create(process.INSTANCES).map(function(i) {
	// 	return ['exists', `${redis.RH.TRADABLES}:${process.INSTANCES}:${i}`]
	// })
	// let exists = await redis.main.pipecoms(coms) as number[]
	// if (_.sum(exists) != process.INSTANCES) {
	// 	await chunkSymbols()
	// }
	await chunkSymbols()

	console.info('readyInstruments -> done')
	radio.emit('readyInstruments')

}



async function syncInstruments() {
	await pforever(async function(url) {

		let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
		_.remove(response.results, v => v.symbol.match(/\W+/))
		if (DEVELOPMENT) console.log('syncInstruments ->', console.inspect(response.results.length));

		let coms = response.results.map(v => ['hmset', redis.RH.INSTRUMENTS + ':' + v.symbol, v as any])

		let symbols = new redis.SetsComs(redis.RH.SYMBOLS)
		let tradables = new redis.SetsComs(redis.RH.TRADABLES)
		let untradables = new redis.SetsComs(redis.RH.UNTRADABLES)
		response.results.forEach(function(v) {
			symbols.sadd(v.symbol)
			let active = v.state == 'active' && v.tradability == 'tradable' && v.tradeable == true
			if (active) {
				tradables.sadd(v.symbol)
				untradables.srem(v.symbol)
			} else {
				tradables.srem(v.symbol)
				untradables.sadd(v.symbol)
			}
		})
		symbols.concat(coms)
		tradables.concat(coms)
		untradables.concat(coms)

		await redis.main.pipecoms(coms)
		return response.next || pforever.end

	}, 'https://api.robinhood.com/instruments/')

	console.info('syncInstruments -> done')
	radio.emit('syncInstruments')

}



async function chunkSymbols() {
	let resolved = await redis.main.pipecoms([
		['smembers', redis.RH.SYMBOLS],
		['smembers', redis.RH.TRADABLES],
		['smembers', redis.RH.UNTRADABLES],
	])
	
	console.log('resolved ->', console.inspect(resolved))

	// let symbols = (await redis.main.smembers(redis.RH.TRADABLES) as string[]).sort()
	// let chunks = core.array.chunks(symbols, process.INSTANCES)
	// let coms = chunks.map((v, i) => ['set', `${redis.RH.TRADABLES}:${process.INSTANCES}:${i}`, v.toString()])
	// await redis.main.pipecoms(coms)

	console.info('chunkSymbols -> done')
	radio.emit('chunkSymbols')

}



async function readyWebullTickerIds() {

}

