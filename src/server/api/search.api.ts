// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as http from '../adapters/http'
import * as got from 'got'
import polka from './polka'



polka.route({
	method: 'POST',
	url: '/api/search',
	schema: {
		body: { query: 'string' },
	},
	handler(req, res) {
		let query = core.string.clean(req.body.query).toLowerCase()
		return http.get('https://api.robinhood.com/instruments', {
			query: { query },
		}).then(function(response: Robinhood.Api.Paginated<Robinhood.Instrument>) {
			return response.results.map(function(v) {
				return _.pick(v, ['symbol', 'name', 'type'] as KeysOf<Robinhood.Instrument>)
			})
		})
	}
})



// http.get('https://api.robinhood.com/instruments', {
// 	// query: { query: 'nvda' }
// }).then(function(response) {
// 	console.log('response ->', response)
// }).catch(function(error) {
// 	console.error('setTimeout Error ->', error)
// })


