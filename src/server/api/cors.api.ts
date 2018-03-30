// 

import * as util from 'util'
import * as _ from 'lodash'
import * as core from '../../common/core'

import fastify from './fastify'
import * as boom from 'boom'
import * as got from 'got'



fastify.route({
	method: 'POST',
	url: '/api/cors',
	handler: async function(request, reply) {
		if (!request.authed) throw boom.unauthorized();

		let config = request.body
		let response = await got(config.url, config)
		return response.body

	},
})


