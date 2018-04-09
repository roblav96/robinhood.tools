// 

import * as _ from '../../common/lodash'
import fastify from './fastify'
import * as boom from 'boom'
import * as gerrors from 'got/errors'



async function onErrorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply, isCatcher = false) {
	if (error == null) error = boom.internal('onErrorHandler -> error == null');

	if (Array.isArray(error.validation)) {
		let validation = error.validation[0]
		let param = validation.dataPath.substr(1)
		param = param ? `'${param}'` : 'is missing,'
		let message = 'Parameter ' + param + ' ' + validation.message
		error = boom.preconditionFailed(message, error.validation)
	}

	if (error instanceof gerrors.GotError) {
		let gerror = (error as any) as Http.GotError
		error = new boom(gerror.message, {
			statusCode: gerror.statusCode,
			data: gerror.response.body,
		})
		error.isGot = true
	}

	if (!error.isBoom) error = new boom(error);

	if (!error.isCaught) {
		if (error.data) _.defaults(error.output.payload, { attributes: error.data });
		reply.type('application/json')
		reply.code(error.output.statusCode)
		reply.headers(error.output.headers)
		error.isCaught = true
	}
	if (isCatcher) return error;
	else return error.output.payload;

}

class Catcher {
	constructor(handler: FastifyHandler) {
		return function(request: FastifyRequest, reply: FastifyReply) {
			return handler(request, reply).catch(function(error: FastifyError) {
				return onErrorHandler(error, request, reply, true)
			})
		}
	}
}

fastify.addHook('onRoute', function onRouteHook(opts) {
	opts.handler = new Catcher(opts.handler)
})

fastify.setErrorHandler(onErrorHandler)

fastify.setNotFoundHandler(async function(request, reply) {
	let error = boom.notFound(`Endpoint '${request.raw.url}' does not exist`)
	return onErrorHandler(error, request, reply)
})




