// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as utils from '../adapters/utils'
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
		if (!query) return []
		console.log(`query ->`, query)

		let results = (await new Promise<Pandora.HubMessage>(resolve => {
			pandora.once('search.results', resolve)
			pandora.send({ processName: 'search.service' }, 'search.query', query)
		})).data as Quotes.Quote[]

		// console.log(`results ->`, results)
		// pandora.once('search.results', function onresults(hubmsg: Pandora.HubMessage) {
		// 	console.log(`search.results hubmsg ->`, hubmsg)
		// 	let results = hubmsg.data as Quotes.Quote[]

		// })



		return []



		// let { results } = await http.get('https://api.robinhood.com/instruments/', {
		// 	query: { query }, retries: 0,
		// }) as Robinhood.Api.Paginated<Robinhood.Instrument>
		// results.remove(v => !v || !v.symbol || Array.isArray(v.symbol.match(utils.matchSymbol)))
		// // console.log('results ->', results)
		// return results.map(v => _.pick(v, IKEYS))
		// // let instruments = await getInstruments(results.map(v => v.symbol))
		// // console.log('instruments ->', instruments)
		// // return instruments
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
		results = results.map(v => redis.fixHmget(v, IKEYS))
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


