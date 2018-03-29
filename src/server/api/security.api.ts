// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import { CookieSerializeOptions } from 'cookie'
import fastify from './fastify'
import * as boom from 'boom'
import * as url from 'url'
import * as redis from '../adapters/redis'
import * as security from '../services/security'



fastify.route({
	method: 'GET',
	url: '/api/security/token',
	handler: async function(this: FastifyInstance, request, reply) {
		let prime = security.randomBytes(32)
		await redis.main.hset('security:doc:' + request.doc.uuid, 'prime', prime)

		let cookie = {
			domain: url.parse(process.DOMAIN).hostname,
			path: '/', sameSite: true, httpOnly: true,
			secure: PRODUCTION,
		} as CookieSerializeOptions

		request.doc.bytes = security.randomBytes(32)
		reply.setCookie('x-bytes', request.doc.bytes, cookie)
		let token = security.generateToken(request.doc, prime)
		reply.setCookie('x-token', token, cookie)

		return true

	},
})

