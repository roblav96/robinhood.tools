// 

import fastify from './fastify'
import * as boom from 'boom'
import * as got from 'got'



fastify.route({
	method: 'POST',
	url: '/api/proxy',
	handler: async function(request, reply) {
		// if (!request.authed) throw boom.unauthorized();

		let config = request.body
		let response = await got(config.url, config).catch(function (error: got.GotError) {
			console.error('got Error ->', error)
			throw error
		})
		console.log('response.body ->', response.body)
		return response.body

	},
})


