// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import polka from './polka'



polka.route({
	method: 'POST',
	url: '/api/symbols/instruments',
	public: true,
	schema: {
		body: { symbols: { type: 'array', items: 'string' } },
	},
	async handler(req, res) {
		let symbols = req.body.symbols as string[]
		let coms = symbols.map(v => ['hgetall', `${rkeys.RH.INSTRUMENTS}:${v}`])
		let instruments = await redis.main.coms(coms) as Robinhood.Instrument[]
		instruments.forEach(core.fix)
		return instruments.map(function(v) {
			return _.pick(v, ['symbol', 'name', 'type'] as KeysOf<Robinhood.Instrument>)
		})
	}
})





