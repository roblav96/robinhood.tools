// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as common from '../../common'

import fastify from '../fastify'
import * as boom from 'boom'
import * as got from 'got'
import redis from '../adapters/redis'



fastify.route({
	method: 'POST',
	url: '/api/robinhood/login',
	schema: {
		body: {
			type: 'object',
			properties: {
				username: { type: 'string' },
				password: { type: 'string' },
			},
		},
		response: {
			200: {
				type: 'object',
				properties: {
					token: { type: 'string' },
				},
			},
		},
	},
	handler: async function(request, reply) {
		if (!request.authed) throw boom.unauthorized();
		let human = await redis.get('security:human:' + request.doc.uuid)
		console.log('human >')
		eyes.inspect(human)
		if (!human) throw boom.preconditionRequired('Recaptcha must be complete');
		
		console.log('request.body >')
		eyes.inspect(request.body)
		
		return { token: common.security.random(16) }
	},
})


