// 

import * as _ from 'lodash'
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

	if (!error.isBoom) {
		// console.error('onErrorHandler else Error ->', console.dump(error))
		error = new boom(error)
	}

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





// fastify.setErrorHandler(async function(error, request, reply) {
// 	console.error('setErrorHandler Error ->', error)
// 	reply.type('application/json')
// 	reply.code(error.output.statusCode)
// 	reply.headers(error.output.headers)
// 	return error.output.payload
// })

// fastify.decorate('boom', function(error, reply) {
// 	if (error.data) _.defaults(error.output.payload, { attributes: error.data });
// 	reply.type('application/json')
// 	reply.code(error.output.statusCode)
// 	reply.headers(error.output.headers)
// 	console.log('error.output ->', error.output)
// 	// return error.output.payload
// 	return error
// })



// class Catcher {
// 	constructor(handler: (request, reply) => Promise<any>) {
// 		return function(request, reply: Fastify.FastifyReply<any>) {
// 			return handler(request, reply).catch(function(error: Fastify.FastifyError) {
// 				console.error('Catcher Error ->', error)
// 				if (error.isBoom) {
// 					if (error.data) _.defaults(error.output.payload, { attributes: error.data });
// 					reply.type('application/json')
// 					reply.code(error.output.statusCode)
// 					reply.headers(error.output.headers)
// 					// reply.send(error.output.payload)
// 				}
// 				return Promise.reject(error)
// 			})
// 		}
// 	}
// }





// fastify.decorate('catcher', function(request, reply) {
// 	return
// })





// fastify.addHook('onRequest', async function(request, reply) {
// 	console.log('onRequest request ->', request)
// })
// fastify.addHook('onSend', async function(request, reply, payload) {
// 	console.log('onSend payload ->', payload)
// 	return payload
// })
// fastify.addHook('onResponse', async function(reply) {
// 	console.log('onResponse reply ->', reply)
// })



// fastify.setErrorHandler(async function(error, request, reply) {
// 	console.error('setErrorHandler error ->', error)
// 	console.log('reply.res.statusCode ->', reply.res.statusCode)
// 	// console.error('BEFORE error handler Error ->', error)
// 	// if (error == null) error = boom.internal();

// 	// if (Array.isArray(error.validation)) {
// 	// 	let validation = error.validation[0]
// 	// 	let param = validation.dataPath.substr(1)
// 	// 	param = param ? `'${param}'` : 'is missing,'
// 	// 	let message = 'Parameter ' + param + ' ' + validation.message
// 	// 	error = boom.preconditionFailed(message, error.validation)
// 	// }

// 	// if (!boom.isBoom(error)) error = boom.boomify(error);
// 	// if (error.data) _.defaults(error.output.payload, { attributes: error.data });
// 	// console.error('AFTER error handler Error ->', error)

// 	reply.type('application/json')
// 	reply.code(error.output.statusCode)
// 	reply.headers(error.output.headers)
// 	return error.output.payload

// })



// fastify.setNotFoundHandler(async function(request, reply) {
// 	let boomed = boom.notFound(`Endpoint '${request.raw.url}' does not exist`)
// 	reply.code(boomed.output.statusCode)
// 	return boomed
// })


