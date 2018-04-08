// 
// if (process.MASTER) { console.error('fastify -> process.MASTER should not import fastify', '\n'); process.exit(1) }
// 

import * as Fastify from 'fastify'
import * as Pino from 'pino'
import stream from './fastify.logger'



const LOG_LEVEL = 'info' as Pino.Level

const fastify = Fastify({
	logger: { level: LOG_LEVEL, extreme: PRODUCTION, stream },
})

fastify.server.timeout = 10000
fastify.server.keepAliveTimeout = 1000

fastify.after(function(error) {
	if (error) return console.error('after Error ->', error);
})

export default fastify



import './fastify.errors'
import './fastify.plugins'

import './security.hook'
import './security.api'

import './socket.server'
import './socket.api'

import './proxy.api'
import './recaptcha.api'
import './search.api'



// import radio from '../adapters/radio'
// fastify.register(function(instance, opts, next) {
// 	radio.ready.pipe(true).subscribe(next)
// })



fastify.listen(process.PORT + process.INSTANCE, process.HOST, function(error) {
	if (error) return console.error('listen Error ->', error);
	console.info('listen ->', console.inspect(fastify.server.address()), '\n' + fastify.printRoutes())
})





import { IncomingMessage, ServerResponse, Server } from 'http'
import { ErrorObject } from 'ajv'
import { default as Boom } from 'boom'
declare module 'fastify' {
	interface FastifyRequest<HttpRequest> {
		authed: boolean
		ip: string
		doc: Security.Doc
	}
	interface FastifyReply<HttpResponse> {

	}
	interface FastifyHandler {
		(request: FastifyRequest<IncomingMessage>, reply: FastifyReply<ServerResponse>): Promise<any>
	}
	interface FastifyError extends Boom {
		isCaught?: boolean
		isGot?: boolean
		validation?: ErrorObject[]
	}
	interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {
		addHook(name: 'onRoute', handler: (opts: RegisterOptions<HttpServer, HttpRequest, HttpResponse>) => void): FastifyInstance
		setErrorHandler(handler: (error: FastifyError, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void): Promise<any>
		all(url: string, opts: RouteShorthandOptions<HttpServer, HttpRequest, HttpResponse>, handler: RequestHandler<HttpRequest, HttpResponse>): FastifyInstance
		all(url: string, handler: RequestHandler<HttpRequest, HttpResponse>): FastifyInstance
	}
}

declare global {
	type Fastify = typeof fastify
	interface FastifyMiddleware extends Fastify.FastifyMiddleware<Server, IncomingMessage, ServerResponse> { }
	interface FastifyRegisterOptions extends Fastify.RegisterOptions<Server, IncomingMessage, ServerResponse> { }
	interface FastifyRequest extends Fastify.FastifyRequest<IncomingMessage> { }
	interface FastifyReply extends Fastify.FastifyReply<ServerResponse> { }
	interface FastifyHandler extends Fastify.FastifyHandler { }
	interface FastifyError extends Fastify.FastifyError { }
	interface FastifyInstance extends Fastify.FastifyInstance { }
}


