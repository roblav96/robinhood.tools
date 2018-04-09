// 

import * as Fastify from 'fastify'
import * as Pino from 'pino'
import * as Rx from '../../common/rxjs'
import logger from './fastify.logger'



const fastify = Fastify({
	logger: {
		level: 'info' as Pino.Level,
		extreme: PRODUCTION,
		stream: logger,
	},
})

fastify.server.timeout = 10000
// fastify.server.keepAliveTimeout = 5000

fastify.rxready = new Rx.ReadySubject()

fastify.after(function(error) {
	if (error) return console.error('after Error ->', error);
})

export default fastify



import './fastify.errors'
import './fastify.plugins'

import './security.hook'
import './security.api'

// import './socket.server'
// import './socket.api'

// import './proxy.api'
// import './recaptcha.api'
// import './search.api'



fastify.listen(process.PORT + process.INSTANCE, process.HOST, function(error) {
	if (error) return console.error('listen Error ->', error);
	// if (process.PRIMARY) console.info('listen ->', console.inspect(fastify.server.address()), '\n' + fastify.printRoutes());
	// console.info('listen ->', console.inspect(fastify.server.address()), '\n' + fastify.printRoutes())
	// console.info('listen ->', console.inspect(fastify.server.address()))
	fastify.rxready.next()
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
		rxready: Rx.ReadySubject
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


