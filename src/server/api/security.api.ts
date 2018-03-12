// 

import * as eyes from 'eyes'
import * as clc from 'cli-color'
import * as _ from 'lodash'
import * as common from '../../common'

import server from '../server'
import * as security from '../services/security'
import * as got from 'got'
import * as forge from 'node-forge'
import r from '../adapters/rethinkdb'
import redis from '../adapters/redis'



server.route({
	method: 'GET',
	url: '/api/security/token',
	schema: {
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
		let prime = common.security.random(32)
		await redis.hset('security:doc:' + request.doc.uuid, 'prime', prime)
		// await redis.pipeline()
		// 	.hset('security:doc:' + request.doc.uuid, 'prime', prime)
		// 	.exec().then(redis.fixpipeline)

		let bytes = common.security.random(32)
		reply.setCookie('x-bytes', bytes, {
			domain: 'robinhood.tools', path: '/',
			sameSite: true, httpOnly: true, secure: PRODUCTION,
		})

		let hmac = security.docHmac(request.doc.uuid, bytes, request.hostname, prime)
		return { token: hmac }

	},
})


