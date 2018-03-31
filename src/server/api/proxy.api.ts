// 

import fastify from './fastify'
import * as boom from 'boom'
import * as got from 'got'
import * as http from '../adapters/http'



fastify.route({
	method: 'POST',
	url: '/api/proxy',
	handler: async function(request, reply) {
		// if (!request.authed) throw boom.unauthorized();

		let config = request.body as Http.RequestConfig
		let response = await http.request({
			method: config.method,
			url: config.url,
			retries: 3,
			isProxy: true,
		}).catch(function(error: got.GotError) {
			console.error('got Error ->', error)
			throw error
		})
		console.log('response.body ->', response.body)
		return response.body

	},
})


