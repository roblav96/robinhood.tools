// 
if (process.MASTER) { console.error('fastify -> process.MASTER should not import fastify', '\n'); process.exit(1) }
// 

import * as http from 'http'
import * as Pino from 'pino'
import * as Fastify from 'fastify'



const LOG_LEVEL = 'error' as Pino.Level

const fastify = Fastify({
	logger: { level: LOG_LEVEL, prettyPrint: { levelFirst: true, forceColor: true } },
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

import './logger.api'
import './socket.api'
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
}


