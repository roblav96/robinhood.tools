// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as common from '../common'

import * as moment from 'moment'
import * as http from 'http'
import * as fastify from 'fastify'
import * as cors from 'cors'
import * as boom from 'boom'
import * as cookie from 'cookie'
import * as security from './services/security'
import r from './adapters/rethinkdb'
import redis from './adapters/redis'



const server = fastify<http.Server, http.IncomingMessage, http.ServerResponse>({
	// logger: { level: 'error', prettyPrint: { forceColor: true, levelFirst: true, }, },
})
export default server



server.register(require('fastify-cookie'))

server.setNotFoundHandler(async function(request, reply) {
	return boom.notFound()
})

server.setErrorHandler(async function(error: boom & { validation: any }, request, reply) {
	if (Array.isArray(error.validation)) {
		let validation = error.validation[0]
		error = boom.preconditionFailed('Parameter `' + validation.dataPath.substr(1) + '` ' + validation.message) as any
	} else if (!error.isBoom) {
		console.error('setErrorHandler >', error)
		error = boom.internal(error.message) as any
	}
	reply.code(error.output.statusCode)
	reply.headers(error.output.headers)
	reply.type('application/json')
	return error.output.payload
})



server.use(cors({ origin: process.env.DOMAIN }))



server.addHook('preHandler', async function(request, reply) {
	request.authed = false

	// console.log('request.headers >')
	// eyes.inspect(request.headers)
	let invalid = common.valid.headers(request.headers, ['x-uuid', 'x-finger', 'user-agent', 'hostname'])
	if (invalid) throw boom.preconditionFailed('Invalid ' + invalid + ' header');

	request.ip = security.reqip(request)
	request.hostname = request.headers['hostname']

	request.doc = {
		uuid: request.headers['x-uuid'],
		finger: request.headers['x-finger'],
		ua: request.headers['user-agent'],
	}

	// if (request.headers['x-id']) request.doc.id = request.headers['x-id'];
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

	// console.log('request.cookies >')
	// eyes.inspect(request.cookies)
	if (request.cookies['x-bytes']) {
		request.doc.bytes = request.cookies['x-bytes']
	}

	// console.log('request.doc >')
	// eyes.inspect(request.doc)

	if (request.doc.bytes && request.doc.token) {
		let prime = await redis.hget('security:doc:' + request.doc.uuid, 'prime') as string
		if (!prime) return;
		let hmac = security.docHmac(request.doc.uuid, request.doc.bytes, request.hostname, prime)
		request.authed = request.doc.token == hmac
		console.log('request.authed >')
		eyes.inspect(request.authed)
	}

})



import './api/security.api'
import './api/recaptcha.api'
import './api/robinhood.api'



let port = Number.parseInt(process.env.PORT) + process.INSTANCE + 1
server.listen(port, process.env.HOST, function(error) {
	if (error) return console.error('fastify.listen > error', error);
	// console.log('fastify ready >', port)
})





declare module 'fastify' {
	interface FastifyRequest<HttpRequest> {
		cookies: Dict<string>
		authed: boolean
		ip: string
		hostname: string
		doc: Partial<Security.Doc>
	}
	interface FastifyReply<HttpResponse> {
		setCookie: (name: string, value: string, opts: cookie.CookieSerializeOptions) => FastifyReply<HttpResponse>
	}
}


