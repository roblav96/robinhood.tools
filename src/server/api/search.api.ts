// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import polka from './polka'



const IKEYS = ['symbol', 'name'] as KeysOf<Robinhood.Instrument>

polka.route({
	method: 'GET',
	url: '/api/search',
	schema: {
		query: { query: 'string' },
	},
	async handler(req, res) {
		let query = core.string.clean(req.query.query).toLowerCase()
		let { results } = await http.get('https://api.robinhood.com/instruments/', {
			query: { query },
		}) as Robinhood.Api.Paginated<Robinhood.Instrument>
		return results.map(function(v) {
			return _.pick(v, IKEYS)
		})
	}
})

polka.route({
	method: 'POST',
	url: '/api/search/recents',
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
	}
})


