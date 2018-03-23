// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import fastify from '../fastify'
import * as boom from 'boom'
import * as got from 'got'
import * as redis from '../adapters/redis'



fastify.route({
	method: 'POST',
	url: '/api/recaptcha/verify',
	schema: {
		body: {
			type: 'object',
			properties: { response: { type: 'string' }, },
			required: ['response'],
		},
		response: {
			200: {
				type: 'object',
				properties: { success: { type: 'boolean' }, },
				required: ['success'],
			},
		},
	},
	handler: async function(request, reply) {
		let { body } = await got.post('https://www.google.com/recaptcha/api/siteverify', {
			query: {
				response: request.body.response,
				secret: process.env.RECAPTCHA_SECRET,
				remoteip: request.ip,
			}, json: true,
		})
		if (!_.isEmpty(body['error-codes'])) {
			throw boom.badRequest('Recaptcha errors, ' + JSON.stringify(body['error-codes']))
		}
		if (!body.success) throw boom.badRequest('Recaptcha unsuccessful');
		await redis.main.setex('users:human:' + request.doc.uuid, 300, true)
		return { success: body.success }
	},
})


