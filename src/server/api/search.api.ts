// 

import * as lunr from 'lunr'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../../common/http'
import * as utils from '../adapters/utils'
import radio from '../adapters/radio'
import polka from './polka'



async function getQuotes(symbols: string[]) {
	let ikeys = ['symbol', 'name'] as KeysOf<Quotes.Quote>
	let resolved = await redis.main.coms(symbols.map(symbol => {
		return ['hmget', `${rkeys.QUOTES}:${symbol}`].concat(ikeys)
	}))
	return resolved.map((v: Quotes.Quote) => {
		v = redis.fixHmget(v, ikeys)
		core.fix(v)
		return v
	})
}

polka.route({
	method: 'GET',
	url: '/api/search',
	schema: {
		query: { query: 'string' },
	},
	async handler(req, res) {
		let query = core.string.clean(req.query.query)
		if (!query) return [];
		let symbols = await radio.invoke({}, 'search.query', query.toLowerCase()) as string[]
		return getQuotes(symbols)
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
		return getQuotes(symbols)
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


