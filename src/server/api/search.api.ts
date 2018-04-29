// 

import { CookieSerializeOptions } from 'cookie'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as http from '../adapters/http'
import polka from './polka'



// polka.route({
// 	method: 'POST',
// 	url: '/api/search',
// 	async handler(req, res) {

// 		let response = await http.get('https://api.robinhood.com/instruments/', {
// 			query: { query: core.string.clean(req.body.query || '').toLowerCase() },
// 		}) as Robinhood.Api.Paginated<Robinhood.Instrument>

// 		return response.results.map(function(v) {
// 			return _.pick(v, ['symbol', 'name', 'type'] as KeysOf<Robinhood.Instrument>)
// 		})

// 	}
// })
