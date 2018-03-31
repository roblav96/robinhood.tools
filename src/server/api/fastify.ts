// 
if (process.MASTER) { console.error('fastify -> process.MASTER should not import fastify', '\n'); process.exit(1) }
// 

import * as Fastify from 'fastify'
import * as Pino from 'pino'
import stream from './fastify.logger'



const LOG_LEVEL = 'info' as Pino.Level
const fastify = Fastify({
	logger: { level: LOG_LEVEL, extreme: PRODUCTION, stream },
})

export default fastify



import './fastify.errors'
import './fastify.plugins'



import radio from '../adapters/radio'
fastify.register(function(fastify, opts, next) {
	radio.once('_onready_', next)
})



import './security.hook'
import './security.api'

import './socket.api'
import './proxy.api'
import './recaptcha.api'
import './search.api'



fastify.listen(process.PORT + process.INSTANCE, process.HOST, function(error) {
	if (error) return console.error('listen Error ->', error);
	if (process.PRIMARY) {
		console.info('listen ->', fastify.server.address().address + ':' + fastify.server.address().port, '\n', fastify.printRoutes())
	}
})





declare module 'fastify' {
	interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {
		addHook(name: 'onRoute', fn: (opts: RegisterOptions<HttpServer, HttpRequest, HttpResponse>) => void): FastifyInstance
	}
	interface FastifyRequest<HttpRequest> {
		authed: boolean
		ip: string
		doc: Security.Doc
	}
	interface FastifyReply<HttpResponse> {

	}
}


