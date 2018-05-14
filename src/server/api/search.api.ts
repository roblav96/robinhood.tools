// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import polka from './polka'



let IKEYS = ['symbol', 'name', 'simple_name'] as KeysOf<Robinhood.Instrument>

polka.route({
	method: 'GET',
	url: '/api/search',
	schema: {
		query: { query: 'string' },
	},
	async handler(req, res) {
		let query = core.string.clean(req.query.query).toLowerCase()
		let { results } = await http.get('https://api.robinhood.com/instruments/', {
			query: { query }, retries: 0,
		}) as Robinhood.Api.Paginated<Robinhood.Instrument>
		results.remove(v => !v || !v.symbol || Array.isArray(v.symbol.match(/[^A-Z-.]/)))
		results.forEach(core.fix)
		// console.log('results ->', results)
		return results.map(v => _.pick(v, IKEYS))
		// let instruments = await getInstruments(results.map(v => v.symbol))
		// console.log('instruments ->', instruments)
		// return instruments
	}
})

polka.route({
	method: 'POST',
	url: '/api/recents',
	schema: {
		body: {
			symbols: { type: 'array', items: 'string' },
		},
	},
	async handler(req, res) {
		let symbols = req.body.symbols as string[]
		let coms = symbols.map(v => ['hmget', `${rkeys.RH.INSTRUMENTS}:${v}`].concat(IKEYS))
		let results = await redis.main.coms(coms) as Robinhood.Instrument[]
		results = results.map(v => redis.fixHmget(v as any, IKEYS))
		results.forEach(core.fix)
		return results
		// return await getInstruments(symbols)
	}
})



// const IKEYS = ['symbol', 'name', 'alive', 'acronym', 'mic', 'type', 'country'] as KeysOf<Robinhood.Instrument>
// async function getInstruments(symbols: string[]) {
// 	let coms = symbols.map(v => ['hmget', `${rkeys.RH.INSTRUMENTS}:${v}`].concat(IKEYS))
// 	let results = await redis.main.coms(coms) as Robinhood.Instrument[]
// 	results = results.map(v => redis.fixHmget(v as any, IKEYS))
// 	results.forEach(core.fix)
// 	return results
// }

// async function getInstruments(symbols: string[]) {
// 	let coms = symbols.map(v => ['hgetall', `${rkeys.RH.INSTRUMENTS}:${v}`])
// 	let results = await redis.main.coms(coms) as Robinhood.Instrument[]
// 	results.forEach(core.fix)
// 	return results
// }


