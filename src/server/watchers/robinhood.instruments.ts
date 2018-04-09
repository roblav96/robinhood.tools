// 

import * as pForever from 'p-forever'
import * as _ from '../../common/lodash'
import * as R from '../../common/rambdax'
import * as Rx from '../../common/rxjs'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import * as core from '../../common/core'
import radio from '../adapters/radio'



export const rxready = new Rx.ReadySubject()
radio.once('robinhood.instruments.ready', () => rxready.next())

if (process.MASTER) {
	radio.rxready.toPromise().then(readyInstruments).catch(function(error) {
		console.error('readyInstruments Error ->', error)
	}).finally(function() {
		radio.emit('robinhood.instruments.ready')
	})
}



async function readyInstruments() {
	// if (DEVELOPMENT) await redis.main.purge(redis.RH.RH);

	let synced = await redis.main.keys(`${redis.RH.INSTRUMENTS}:*`)
	console.log('instruments synced ->', console.inspect(synced.length))
	if (synced.length < 10000) {
		await syncInstruments()
	}

	await chunkSymbols()

	console.info('readyInstruments -> done')

}



async function syncInstruments() {
	await pForever(async function(url) {

		let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
		_.remove(response.results, v => Array.isArray(v.symbol.match(/\W+/)))

		if (DEVELOPMENT) console.log('syncInstruments ->', console.inspect(response.results.length), console.inspect(response.next));

		let coms = response.results.map(v => ['hmset', `${redis.RH.INSTRUMENTS}:${v.symbol}`, v as any])
		let symbols = new redis.SetsComs(redis.RH.SYMBOLS)
		let tradables = new redis.SetsComs(redis.RH.TRADABLES)
		let untradables = new redis.SetsComs(redis.RH.UNTRADABLES)
		response.results.forEach(function(v) {
			symbols.sadd(v.symbol)
			v.mic = _.compact(v.market.split('/')).pop()
			v.acronym = robinhood.MICS[v.mic]
			v.alive = v.state == 'active' && v.tradability == 'tradable' && v.tradeable == true
			if (v.alive) {
				tradables.sadd(v.symbol)
				untradables.srem(v.symbol)
			} else {
				tradables.srem(v.symbol)
				untradables.sadd(v.symbol)
			}
		})
		symbols.merge(coms)
		tradables.merge(coms)
		untradables.merge(coms)

		await redis.main.coms(coms)
		return response.next || pForever.end

	}, 'https://api.robinhood.com/instruments/')

	console.info('syncInstruments -> done')

}



async function chunkSymbols() {
	let rkeys = [redis.RH.SYMBOLS, redis.RH.TRADABLES, redis.RH.UNTRADABLES]
	let rcoms = rkeys.map(v => ['smembers', v])
	let resolved = await redis.main.coms(rcoms) as string[][]

	let coms = [] as Redis.Coms
	resolved.forEach(function(symbols, i) {
		symbols.sort()
		let rkey = rkeys[i]
		let chunks = core.array.chunks(symbols, process.INSTANCES)
		chunks.forEach(function(chunk, ii) {
			coms.push(['set', `${rkey}:${process.INSTANCES}:${ii}`, chunk.toString()])
		})
	})
	await redis.main.coms(coms)

	console.info('chunkSymbols -> done')

}




