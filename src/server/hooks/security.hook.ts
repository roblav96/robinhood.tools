// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as security from '../../common/security'

import fastify from '../fastify'
import * as boom from 'boom'
import * as redis from '../adapters/redis'



fastify.addHook('preHandler', async function preHandler(request, reply) {

	let required = ['x-uuid', 'x-finger', 'user-agent', 'hostname', 'x-forwarded-for', 'x-real-ip']
	let missing = _.difference(required, Object.keys(request.headers))
	if (missing.length > 0) {
		throw boom.preconditionFailed('Missing security headers: ' + JSON.stringify(missing))
	}

	request.ip = request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || request.req.connection.remoteAddress || request.req.socket.remoteAddress
	request.hostname = request.headers['hostname']
	request.ua = request.headers['hostname']
	request.doc = {
		id: request.headers['x-id'],
		uuid: request.headers['x-uuid'],
		finger: request.headers['x-finger'],
		token: request.headers['x-token'],
		bytes: request.cookies['x-bytes'],
	}

	if (request.doc.token) {
		let split = request.doc.token.split('.')
		if (split.length != 2) {
			throw boom.preconditionFailed('Invalid security header: "x-token"')
		}
		request.doc.token = split[0]
		let stamp = Number.parseInt(split[1])
		let now = Date.now()
		if (!_.inRange(stamp, now - 10000, now + 10000)) {
			throw boom.preconditionFailed('Expired security header: "x-token"')
		}
	}

	request.authed = false
	if (request.doc.token && request.doc.bytes) {
		let prime = await redis.main.hget('security:doc:' + request.doc.uuid, 'prime')
		if (prime) {
			let token = security.generateToken(request.doc, request.hostname, prime)
			request.authed = request.doc.token == token
		}
	}

})




