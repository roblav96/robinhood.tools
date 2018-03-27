// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import fastify from '../fastify'
import * as boom from 'boom'
import * as got from 'got'



fastify.route({
	method: 'POST',
	url: '/api/cors',
	handler: async function(this: FastifyInstance, request, reply) {

		let config = request.body
		return got(config.url, config).then(function({ body }) {
			return body

		}).catch(function(error) {
			throw boom.badRequest(error.message, DEVELOPMENT ? error : undefined)
		})

	},
})


