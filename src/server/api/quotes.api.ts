// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import polka from './polka'



polka.route({
	method: 'POST',
	url: '/api/quotes',
	public: true,
	schema: {
		body: { symbols: { type: 'array', items: 'string' } },
	},
	async handler(req, res) {
		let symbols = req.body.symbols as string[]
		let coms = symbols.map(v => ['hgetall', `${rkeys.QUOTES}:${v}`])
		let quotes = await redis.main.coms(coms) as Quote[]
		quotes.forEach(core.fix)
		return quotes
	}
})





