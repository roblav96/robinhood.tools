// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as security from '../../common/security'

import fastify from '../fastify'
import * as boom from 'boom'
import * as url from 'url'
import * as redis from '../adapters/redis'



declare global {
	namespace Security {
		interface TokenRequest {
			now: number
		}
		interface TokenReply {
			token: string
		}
	}
}
fastify.route({
	method: 'POST',
	url: '/api/security/token',
	schema: {
		body: {
			type: 'object',
			properties: {
				now: { type: 'number' },
			},
			required: ['now'],
		},
		response: {
			200: {
				type: 'object',
				properties: {
					token: { type: 'string' },
				},
				required: ['token'],
			},
		},
	},
	handler: async function(this: FastifyInstance, request, reply) {
		let prime = await security.generateProbablePrime(16)
		await redis.main.hset('security:doc:' + request.doc.uuid, 'prime', prime)

		request.doc.bytes = security.randomBytes(16)
		reply.setCookie('x-bytes', request.doc.bytes, {
			domain: url.parse(process.DOMAIN).host, path: '/',
			sameSite: true, httpOnly: true, secure: PRODUCTION,
		})

		return {
			token: security.generateToken(request.doc, request.hostname, prime),
		} as Security.TokenReply
	},
})


