// 
if (process.MASTER) { console.error('fastify -> process.MASTER should not import fastify', '\n'); process.exit(1) }
// 

import * as http from 'http'
import * as Fastify from 'fastify'



const fastify = Fastify({
	logger: { level: 'debug', prettyPrint: { levelFirst: true, forceColor: true } },
})

export default fastify

import './fastify.errors'
import './fastify.plugins'



import radio from '../adapters/radio'
fastify.register(function(fastify, opts, next) {
	radio.once('_onready_', next)
})



import './security.hook'

import './logger.api'
import './socket.api'
import './security.api'
import './cors.api'
import './recaptcha.api'
import './search.api'



fastify.listen(process.PORT + process.INSTANCE, process.HOST, function(error) {
	if (error) return console.error('listen Error ->', error);
	if (process.PRIMARY) console.info('listen ->', fastify.server.address().address + ':' + fastify.server.address().port, '\n', fastify.printRoutes());
})





declare module 'fastify' {
	interface FastifyRequest<HttpRequest> {
		authed: boolean
		ip: string
		doc: Security.Doc
	}
	interface FastifyReply<HttpResponse> {

	}
	interface FastifyInstance<HttpServer = http.Server, HttpRequest = http.IncomingMessage, HttpResponse = http.ServerResponse> {
		setNotFoundHandler(fn: (this: FastifyInstance, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void): void
		setErrorHandler(fn: (this: FastifyInstance, error: FastifyError, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void): void
	}
}

declare global {
	type Fastify = typeof fastify
	type FastifyInstance = Fastify.FastifyInstance
	type FastifyRegisterOptions = Fastify.RegisterOptions<http.Server, http.IncomingMessage, http.ServerResponse>
	type FastifyMiddleware = Fastify.FastifyMiddleware<http.Server, http.IncomingMessage, http.ServerResponse>
	type FastifyRequest = Fastify.FastifyRequest<http.IncomingMessage>
	type FastifyReply = Fastify.FastifyReply<http.ServerResponse>
	type FastifyHandler = (this: Fastify.FastifyInstance, request: Fastify.FastifyRequest<http.IncomingMessage>, reply: Fastify.FastifyReply<http.ServerResponse>) => Promise<any>
}


