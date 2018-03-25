// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import fastify from '../fastify'
import * as boom from 'boom'
import * as fuzzysort from 'fuzzysort'
import * as webull from '../adapters/webull'



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
		
		let results = await webull.search(query)
		
		// let results = await stores.search(query)
		// results.forEach(function(result) {
		// 	let desc = result.apple ? result.description : result.summary
		// 	let input = core.string.clean(result.title + ' ' + desc).toLowerCase()
		// 	let match = fuzzy.match(query, input)
		// 	result.fuzzy = match ? match.score : 0
		// })
		// results.sort((a, b) => b.fuzzy - a.fuzzy)
		return results
	},
})


