// 

import * as util from 'util'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'

import fastify from './fastify'
import * as boom from 'boom'
import * as http from '../adapters/http'



fastify.route({
	method: 'POST',
	url: '/api/search',
	schema: {
		body: {
			type: 'object',
			properties: { query: { type: 'string' }, },
			required: ['query'],
		},
	},
	handler: async function(request, reply) {
		let query = core.string.clean(request.body.query).toLowerCase()
		if (!query) return [];

		let response = await http.get('https://api.robinhood.com/instruments/', {
			query: { query },
		}) as Robinhood.API.Paginated<Robinhood.Instrument>

		return response.results.map(v => ({
			symbol: v.symbol,
			name: v.name,
		}))

	},
})


