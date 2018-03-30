// 

import fastify from './fastify'
import * as boom from 'boom'



fastify.route({
	method: 'GET',
	url: '/api/logger',
	handler: async function(request, reply) {
		return true
	},
})


