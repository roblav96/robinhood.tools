// 
if (process.MASTER) { console.error('fastify -> process.MASTER should not be required!\n'); process.exit(1) }
// 

import * as Fastify from 'fastify'
import * as boom from 'boom'



const fastify = Fastify({
	logger: { level: 'debug', prettyPrint: { levelFirst: true, forceColor: true } },
})
export default fastify



fastify.setNotFoundHandler(async function(request, reply) {
	return boom.notFound(`API resource '${request.raw.url}' does not exist`)
})

fastify.setErrorHandler(async function(error, request, reply) {
	// console.error('BEFORE error handler Error ->', error)
	if (!error) error = boom.internal();

	if (Array.isArray(error.validation)) {
		let validation = error.validation[0]
		let param = validation.dataPath.substr(1)
		param = param ? `'${param}'` : 'is missing,'
		let message = 'Parameter ' + param + ' ' + validation.message
		error = boom.preconditionFailed(message, error.validation)
	}

	if (!boom.isBoom(error)) {
		error = boom.boomify(error, { override: false })
	}
	// console.error('AFTER error handler Error ->', error)

	reply.code(error.output.statusCode)
	reply.headers(error.output.headers)
	reply.type('application/json')
	return error.output.payload

})



fastify.after(function(error) {
	if (error) console.error('after Error ->', error);
})

fastify.listen(process.PORT + process.INSTANCE, process.HOST, function(error) {
	if (error) return console.error('listen Error ->', error);
	if (process.PRIMARY) console.info('listen ->', fastify.server.address().address + ':' + fastify.server.address().port, '\n', fastify.printRoutes());
})



import './fastify.plugins'

import './security.hook'

import './logger.api'
import './socket.api'
import './security.api'
import './cors.api'
import './recaptcha.api'
import './search.api'





import * as http from 'http'
import * as ajv from 'ajv'
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
	type FastifyError = boom & { validation?: ajv.ErrorObject[] }
	type FastifyRegisterOptions = Fastify.RegisterOptions<http.Server, http.IncomingMessage, http.ServerResponse>
	type FastifyMiddleware = Fastify.FastifyMiddleware<http.Server, http.IncomingMessage, http.ServerResponse>
	type FastifyRequest = Fastify.FastifyRequest<http.IncomingMessage>
	type FastifyReply = Fastify.FastifyReply<http.ServerResponse>
	type FastifyHandler = (this: Fastify.FastifyInstance, request: Fastify.FastifyRequest<http.IncomingMessage>, reply: Fastify.FastifyReply<http.ServerResponse>) => Promise<any>
}


