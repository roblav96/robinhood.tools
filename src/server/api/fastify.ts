// 
if (process.MASTER) { console.error('fastify -> process.MASTER should not import fastify', '\n'); process.exit(1) }
// 

import * as Fastify from 'fastify'
import * as Pino from 'pino'
import stream from './fastify.logger'



const LOG_LEVEL = 'error' as Pino.Level

const fastify = Fastify({
	logger: { level: LOG_LEVEL, extreme: PRODUCTION, stream },
})

export default fastify



import './fastify.errors'
import './fastify.plugins'



import * as radio from '../adapters/radio'
fastify.register(function(fastify, opts, next) {
	radio.ready.subscribe(next)
})



import './security.hook'
import './security.api'

import './socket.server'
import './socket.api'

import './proxy.api'
import './recaptcha.api'
import './search.api'



fastify.listen(process.PORT + process.INSTANCE, process.HOST, function(error) {
	if (error) return console.error('listen Error ->', error);
	// if (process.PRIMARY) console.info('listen ->', fastify.server.address().address + ':' + fastify.server.address().port, '\n', fastify.printRoutes());
})





import * as http from 'http'
import * as boom from 'boom'
import * as ajv from 'ajv'
declare module 'fastify' {
	interface FastifyRequest<HttpRequest> {
		authed: boolean
		ip: string
		doc: Security.Doc
	}
	interface FastifyReply<HttpResponse> {

	}
	interface FastifyHandler {
		(request: FastifyRequest<http.IncomingMessage>, reply: FastifyReply<http.ServerResponse>): Promise<any>
	}
	interface FastifyError extends boom {
		isCaught?: boolean
		isGot?: boolean
		validation?: ajv.ErrorObject[]
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
	interface FastifyMiddleware extends Fastify.FastifyMiddleware<http.Server, http.IncomingMessage, http.ServerResponse> { }
	interface FastifyRegisterOptions extends Fastify.RegisterOptions<http.Server, http.IncomingMessage, http.ServerResponse> { }
	interface FastifyRequest extends Fastify.FastifyRequest<http.IncomingMessage> { }
	interface FastifyReply extends Fastify.FastifyReply<http.ServerResponse> { }
	interface FastifyHandler extends Fastify.FastifyHandler { }
	interface FastifyError extends Fastify.FastifyError { }
	interface FastifyInstance extends Fastify.FastifyInstance { }
}


