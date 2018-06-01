// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as utils from '../adapters/utils'
import radio from '../adapters/radio'
import polka from './polka'



async function getQuotes(symbols: string[]) {
	let ikeys = ['symbol', 'name'] as KeysOf<Quotes.Quote>
	let quotes = (await redis.main.coms(symbols.map(symbol => {
		return ['hmget', `${rkeys.QUOTES}:${symbol}`].concat(ikeys)
	}))).map(v => redis.fixHmget(v, ikeys)) as Quotes.Quote[]
	quotes.forEach(core.fix)
	return quotes
}

polka.route({
	method: 'GET',
	url: '/api/search',
	schema: {
		query: { query: 'string' },
	},
	async handler(req, res) {
		let query = req.query.query as string
		if (!query) return [];
		let symbols = await radio.invoke({}, 'search.query', query)
		let quotes = await getQuotes(symbols)
		return quotes
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
		let quotes = await getQuotes(symbols)
		return quotes
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


