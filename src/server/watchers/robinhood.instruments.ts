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

	let synced = await redis.main.keys(redis.RH.INSTRUMENTS + ':*')
	if (synced.length < 10000) {
		await syncInstruments()
	}

	await chunkSymbols()

	console.info('readyInstruments -> done')
	radio.emit('readyInstruments')

}



async function syncInstruments() {
	await pforever(async function(url) {

		let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
		_.remove(response.results, v => Array.isArray(v.symbol.match(/\W+/)))
		if (DEVELOPMENT) console.log('syncInstruments ->', console.inspect(response.results.length), console.inspect(response.next));

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

		await redis.main.coms(coms)
		return response.next || pforever.end

	}, 'https://api.robinhood.com/instruments/')

	console.info('syncInstruments -> done')
	radio.emit('syncInstruments')

}



async function chunkSymbols() {
	let rkeys = [redis.RH.SYMBOLS, redis.RH.TRADABLES, redis.RH.UNTRADABLES]
	let rcoms = rkeys.map(v => ['smembers', v])
	let resolved = await redis.main.coms(rcoms) as string[][]

	let coms = [] as Redis.Coms
	resolved.forEach(function(symbols, i) {
		let rkey = rkeys[i]
		let chunks = core.array.chunks(symbols, process.INSTANCES)
		chunks.forEach(function(chunk, ii) {
			coms.push(['set', `${rkey}:${process.INSTANCES}:${ii}`, chunk.toString()])
		})
	})
	await redis.main.coms(coms)

	console.info('chunkSymbols -> done')
	radio.emit('chunkSymbols')

}



async function readyWebullTickerIds() {
	// console.warn('readyWebullTickerIds')
}

