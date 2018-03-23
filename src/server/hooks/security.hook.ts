// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as security from '../../common/security'

import fastify from '../fastify'
import * as boom from 'boom'
import * as redis from '../adapters/redis'



fastify.addHook('preHandler', async function preHandler(request, reply) {
	
	// console.info('request.headers >')
	// eyes.inspect(request.headers)
	// let invalid = core.valid.headers(request.headers, ['x-uuid', 'x-finger', 'user-agent', 'hostname', 'x-forwarded-for', 'x-real-ip'])
	// if (invalid) throw boom.preconditionFailed('Invalid ' + invalid + ' header, pre-handler hook');

	request.ip = request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || request.req.connection.remoteAddress || request.req.socket.remoteAddress || null
	request.hostname = request.headers['hostname']
	request.doc = {
		uuid: request.headers['x-uuid'],
		finger: request.headers['x-finger'],
		ua: request.headers['user-agent'],
	}

	if (request.headers['x-id']) request.doc.id = request.headers['x-id'];
	if (request.headers['x-token']) {
		let split = request.headers['x-token'].split('.')
		if (split.length != 2) {
			throw boom.preconditionFailed('Invalid x-token header, split.length != 2')
		}
		request.doc.token = split[0]
		let stamp = Number.parseInt(split[1])
		let now = Date.now()
		if (!_.inRange(stamp, now - 5000, now + 5000)) {
			throw boom.preconditionFailed('Expired x-token header')
		}
	}

	if (request.cookies['x-bytes']) {
		request.doc.bytes = request.cookies['x-bytes']
	}

	request.authed = false
	if (request.doc.bytes && request.doc.token) {
		let prime = await redis.main.hget('security:doc:' + request.doc.uuid, 'prime')
		if (prime) {
			let hmac = security.docHmac(request.doc.uuid, request.doc.bytes, request.hostname, prime)
			request.authed = request.doc.token == hmac
		}
	}

})




