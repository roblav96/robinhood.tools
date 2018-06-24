// 

import * as lunr from 'lunr'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../../common/http'
import * as utils from '../adapters/utils'
import * as quotes from '../adapters/quotes'
import radio from '../adapters/radio'
import polka from './polka'



const IKEYS = ['name', 'type', 'acronym'] as KeysOf<Quotes.Quote> // ['symbol', 'name', 'tinyName', 'country', 'exchange', 'acronym', 'mic', 'type', 'typeof'] as KeysOf<Quotes.Quote>

polka.route({
	method: 'GET',
	url: '/api/search',
	schema: {
		query: { query: 'string' },
	},
	async handler(req, res) {
		let query = core.string.alphanumeric(req.query.query).toLowerCase()
		if (!query) return [];
		let results = await radio.invoke({}, 'search.query', query) as Search.Result[]
		if (results.length == 0) return [];
		let alls = await quotes.getAlls(results.map(v => v.symbol), ['quote'], [IKEYS])
		return alls.map((v, i) => Object.assign(v.quote, results[i]))
	}
})

polka.route({
	method: 'POST',
	url: '/api/recents',
	schema: {
		body: { symbols: { type: 'array', items: 'string' } },
	},
	async handler(req, res) {
		let symbols = req.body.symbols as string[]
		let alls = await quotes.getAlls(symbols, ['quote'], [IKEYS])
		return alls.map(v => v.quote)
	}
})


