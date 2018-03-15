// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as common from '../../common'

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
			properties: {
				response: { type: 'string' },
			},
		},
		response: {
			200: {
				type: 'object',
				properties: {
					success: { type: 'boolean' },
				},
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
		await redis.main.setex('security:human:' + request.doc.uuid, 300, true)
		return { success: body.success }
	},
})


