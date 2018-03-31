// 

import * as _ from 'lodash'
import fastify from './fastify'
import * as boom from 'boom'



fastify.after(function(error) {
	if (!error) return;
	console.error('AFTER Error ->', error)
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

	if (!boom.isBoom(error)) error = boom.boomify(error);
	if (error.data) _.defaults(error.output.payload, { attributes: error.data });
	// console.error('AFTER error handler Error ->', error)

	reply.type('application/json')
	reply.code(error.output.statusCode)
	reply.headers(error.output.headers)
	return error.output.payload

})



fastify.setNotFoundHandler(async function(request, reply) {
	return boom.notFound(`Endpoint '${request.raw.url}' does not exist`)
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


