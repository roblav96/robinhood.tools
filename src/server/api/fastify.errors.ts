// 

import fastify from './fastify'
import * as boom from 'boom'



fastify.after(function(error) {
	if (!error) return;
	console.error('after Error ->', error)
})



fastify.setErrorHandler(async function(error, request, reply) {
	// console.error('BEFORE error handler Error ->', error)
	if (error == null) error = boom.internal();

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



fastify.setNotFoundHandler(async function(request, reply) {
	return boom.notFound(`API resource '${request.raw.url}' does not exist`)
})





import * as ajv from 'ajv'
declare module 'fastify' {
	interface FastifyError extends boom {
		validation?: ajv.ErrorObject[]
	}
	interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {
		setErrorHandler(fn: (error: FastifyError, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void): Promise<any>
	}
}


