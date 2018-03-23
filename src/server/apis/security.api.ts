// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as security from '../../common/security'

import fastify from '../fastify'
import * as boom from 'boom'
import * as redis from '../adapters/redis'



fastify.route({
	method: 'GET',
	url: '/api/security/token',
	schema: {
		response: {
			200: {
				type: 'object',
				properties: { token: { type: 'string' } },
				required: ['token'],
			},
		},
	},
	handler: async function(request, reply) {
		let prime = security.random(32)
		await redis.main.hset('users:doc:' + request.doc.uuid, 'prime', prime)

		let bytes = security.random(32)
		reply.setCookie('x-bytes', bytes, {
			domain: process.DOMAIN, path: '/',
			sameSite: true, httpOnly: true, secure: PRODUCTION,
		})

		let hmac = security.docHmac(request.doc.uuid, bytes, request.hostname, prime)
		return { token: hmac }

	},
})


