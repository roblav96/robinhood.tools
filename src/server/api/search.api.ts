// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as http from '../adapters/http'
import polka from './polka'



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
			return _.pick(v, ['symbol', 'name', 'type'] as KeysOf<Robinhood.Instrument>)
		})
	}
})


