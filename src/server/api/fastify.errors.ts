// 

import * as ajv from 'ajv'
import * as boom from 'boom'
import fastify from './fastify'



fastify.after(function(error) {
	if (!error) return;
	console.error('after Error ->', error)
})



fastify.register(function(fastify, opts, next) {
	fastify.decorate('boom', boom)
	next()
}, error => { if (error) console.error('fastify-boom Error ->', error); })



fastify.setErrorHandler(async function(error, request, reply) {
	// console.error('BEFORE error handler Error ->', error)
	if (!error) error = this.boom.internal();

	if (Array.isArray(error.validation)) {
		let validation = error.validation[0]
		let param = validation.dataPath.substr(1)
		param = param ? `'${param}'` : 'is missing,'
		let message = 'Parameter ' + param + ' ' + validation.message
		error = this.boom.preconditionFailed(message, error.validation)
	}

	if (!this.boom.isBoom(error)) {
		error = this.boom.boomify(error, { override: false })
	}
	// console.error('AFTER error handler Error ->', error)

	reply.code(error.output.statusCode)
	reply.headers(error.output.headers)
	reply.type('application/json')
	return error.output.payload

})



fastify.setNotFoundHandler(async function(request, reply) {
	return this.boom.notFound(`API resource '${request.raw.url}' does not exist`)
})





declare module 'fastify' {
	interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {
		boom: typeof boom
		setNotFoundHandler(fn: (this: FastifyInstance, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void): void
		setErrorHandler(fn: (this: FastifyInstance, error: FastifyError, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void): void
	}
}

declare global {
	type FastifyError = boom & { validation?: ajv.ErrorObject[] }
}


