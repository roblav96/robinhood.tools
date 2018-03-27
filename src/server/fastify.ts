// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../common/core'

import { CookieSerializeOptions } from 'cookie'
import * as http from 'http'
import * as Fastify from 'fastify'
import * as uws from 'uws'
import * as cors from 'cors'
import * as boom from 'boom'



if (process.MASTER) console.error('process.MASTER Error ->', process.MASTER);

const fastify = Fastify<http.Server, http.IncomingMessage, http.ServerResponse>({
	logger: { level: 'error', prettyPrint: { forceColor: true, levelFirst: true } },
})
export default fastify



fastify.register(require('fastify-cookie'), error => { if (error) console.error('fastify-cookie Error ->', error); })
declare module 'fastify' {
	interface FastifyRequest<HttpRequest> { cookies: Dict<string> }
	interface FastifyReply<HttpResponse> { setCookie: (name: string, value: string, opts: CookieSerializeOptions) => FastifyReply<HttpResponse> }
}



import radio from './services/radio'
fastify.register(function(instance, opts, next) {
	radio.once('_onready_', next)
})



import wss from './services/socket'
fastify.register(function(instance, opts, next) {
	fastify.decorate('wss', wss)
	fastify.addHook('onClose', function(instance, done) {
		instance.wss.close(done)
	})
	next()
})
declare module 'fastify' { interface FastifyInstance { wss: typeof wss } }



import * as products from './watchers/products'
fastify.register(function(instance, opts, next) {
	products.register(next)
})



fastify.setNotFoundHandler(async function(request, reply) {
	return boom.notFound()
})

fastify.setErrorHandler(async function(error: boom & { validation: any }, request, reply) {
	// console.error('setErrorHandler Error ->') // , (error as any).type, error.message, error.stack) // , _.omit(error, 'stack'))
	// eyes.inspect(_.omit(error, 'stack'))
	if (Array.isArray(error.validation)) {
		let validation = error.validation[0]
		let param = validation.dataPath.substr(1)
		param = param ? `"${param}"` : 'is missing,'
		error = boom.preconditionFailed('Parameter ' + param + ' ' + validation.message) as any
	} else if (!error.isBoom) {
		error = boom.internal(error.message) as any
	}
	reply.code(error.output.statusCode)
	reply.headers(error.output.headers)
	reply.type('application/json')
	return error.output.payload
})



fastify.use(cors({ origin: process.DOMAIN }))



import './hooks/security.hook'

import './apis/socket.api'
import './apis/security.api'
import './apis/cors.api'
import './apis/recaptcha.api'
import './apis/search.api'



fastify.listen(process.PORT + process.INSTANCE, process.HOST, function(error) {
	if (error) return console.error('listen Error ->', error);
	if (process.PRIMARY) console.info('listen ->', fastify.server.address().address + ':' + fastify.server.address().port) // , '\n', fastify.printRoutes());
})





declare global {
	type FastifyInstance = Fastify.FastifyInstance<http.Server, http.IncomingMessage, http.ServerResponse>
	type FastifyMiddleware = Fastify.FastifyMiddleware<http.Server, http.IncomingMessage, http.ServerResponse>
	type FastifyRequest = Fastify.FastifyRequest<http.IncomingMessage>
	type FastifyReply = Fastify.FastifyReply<http.ServerResponse>
}

declare module 'fastify' {
	interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {

	}
	interface FastifyRequest<HttpRequest> {
		authed: boolean
		ip: string
		doc: Security.Doc
	}
	interface FastifyReply<HttpResponse> {

	}
}


