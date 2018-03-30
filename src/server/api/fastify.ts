// 
if (process.MASTER) { console.error('process.MASTER Error ->', process.MASTER); process.exit(1); }
// 

import * as _ from 'lodash'
import * as core from '../../common/core'

import * as Fastify from 'fastify'
import logger from '../adapters/logger'



// const fastify = Fastify({ logger: { level: 'debug' } })
const fastify = Fastify({ logger })
export default fastify





import * as path from 'path'
import * as fstatic from 'fastify-static'
fastify.register<FastifyRegisterOptions>(fstatic, {
	root: path.join(process.cwd(), 'public'),
	prefix: '/public/',
}, error => { if (error) console.error('fastify-static Error ->', error); })
declare module 'fastify' {
	interface RegisterOptions<HttpServer, HttpRequest, HttpResponse> {
		root: string
	}
	interface FastifyReply<HttpResponse> { sendFile: (file: string) => void }
}



import { CookieSerializeOptions } from 'cookie'
fastify.register(require('fastify-cookie'), error => { if (error) console.error('fastify-cookie Error ->', error); })
declare module 'fastify' {
	interface FastifyRequest<HttpRequest> { cookies: Dict<string> }
	interface FastifyReply<HttpResponse> { setCookie: (name: string, value: string, opts: CookieSerializeOptions) => FastifyReply<HttpResponse> }
}



import * as boom from 'boom'
fastify.register(function(fastify, opts, next) {
	fastify.decorate('boom', boom)
	next()
})
declare module 'fastify' { interface FastifyInstance { boom: typeof boom } }



import radio from '../services/radio'
fastify.register(function(fastify, opts, next) {
	radio.once('_onready_', next)
})



import wss from '../adapters/wsserver'
fastify.register(function(fastify, opts, next) {
	fastify.decorate('wss', wss)
	fastify.addHook('onClose', function(fastify, done) {
		fastify.wss.close(done)
	})
	next()
})
declare module 'fastify' { interface FastifyInstance { wss: typeof wss } }



import * as products from '../watchers/products'
fastify.register(function(fastify, opts, next) {
	products.register(next)
})





fastify.setNotFoundHandler(async function(request, reply) {
	return boom.notFound(`Endpoint '${request.raw.url}' does not exist`)
})

fastify.setErrorHandler(async function(error, request, reply) {
	// console.error('BEFORE error handler Error ->', error)
	if (!error) {
		error = boom.internal('!error')

	} else if (Array.isArray(error.validation)) {
		let validation = error.validation[0]
		let param = validation.dataPath.substr(1)
		param = param ? `'${param}'` : 'is missing,'
		let message = 'Parameter ' + param + ' ' + validation.message
		error = boom.preconditionFailed(message, error.validation)

	} else if (!boom.isBoom(error)) {
		error = boom.boomify(error, { override: false })

	}
	// console.error('AFTER error handler Error ->', error)

	reply.code(error.output.statusCode)
	reply.headers(error.output.headers)
	reply.type('application/json')
	return error.output.payload

})





import * as url from 'url'
import * as cors from 'cors'
fastify.use(cors({ origin: url.parse(process.DOMAIN).hostname }))

import './security.hook'

import './logger.api'
import './socket.api'
import './security.api'
import './cors.api'
import './recaptcha.api'
import './search.api'





fastify.after(function(error) {
	if (error) console.error('after Error ->', error);
})

fastify.listen(process.PORT + process.INSTANCE, process.HOST, function(error) {
	if (error) return console.error('listen Error ->', error);
	// if (process.PRIMARY) console.info('listen ->', fastify.server.address().address + ':' + fastify.server.address().port, '\n', fastify.printRoutes());
})





import * as http from 'http'
import * as ajv from 'ajv'
declare global {
	type Fastify = typeof fastify
	type FastifyError = boom & { validation?: ajv.ErrorObject[] }
	type FastifyInstance = Fastify.FastifyInstance
	type FastifyRegisterOptions = Fastify.RegisterOptions<http.Server, http.IncomingMessage, http.ServerResponse>
	type FastifyMiddleware = Fastify.FastifyMiddleware<http.Server, http.IncomingMessage, http.ServerResponse>
	type FastifyRequest = Fastify.FastifyRequest<http.IncomingMessage>
	type FastifyReply = Fastify.FastifyReply<http.ServerResponse>
	type FastifyHandler = (this: Fastify.FastifyInstance, request: Fastify.FastifyRequest<http.IncomingMessage>, reply: Fastify.FastifyReply<http.ServerResponse>) => Promise<any>
}
declare module 'fastify' {
	interface FastifyInstance<HttpServer = http.Server, HttpRequest = http.IncomingMessage, HttpResponse = http.ServerResponse> {
		setNotFoundHandler(fn: (this: FastifyInstance, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void): void
		setErrorHandler(fn: (this: FastifyInstance, error: FastifyError, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void): void
	}
	// interface RouteOptions<HttpServer, HttpRequest, HttpResponse> extends RouteShorthandOptions<HttpServer, HttpRequest, HttpResponse> {
	interface RouteOptions<HttpServer, HttpRequest, HttpResponse> {
		// handler: FastifyHandler
		// handler: (request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void | Promise<any>
		// handler: RequestHandler<HttpRequest, HttpResponse>
	}
	interface FastifyRequest<HttpRequest> {
		// REQUEST: never
		authed: boolean
		ip: string
		doc: Security.Doc
	}
	interface FastifyReply<HttpResponse> {
		// REPLY: never
	}
}


