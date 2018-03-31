// 

import * as _ from 'lodash'
import * as Fastify from 'fastify'
import fastify from './fastify'
import * as boom from 'boom'



class Catcher {
	constructor(handler: (request, reply) => Promise<any>) {
		return function(request, reply: Fastify.FastifyReply<any>) {
			return handler(request, reply).catch(function(error: Fastify.FastifyError) {
				console.error('Catcher Error ->', error)
				if (error.isBoom) {
					if (error.data) _.defaults(error.output.payload, { attributes: error.data });
					reply.type('application/json')
					reply.code(error.output.statusCode)
					reply.headers(error.output.headers)
					// reply.send(error.output.payload)
				}
				return Promise.reject(error)
			})
		}
	}
}

fastify.addHook('onRoute', function onRouteHook(opts) {
	opts.handler = new Catcher(opts.handler)
})



fastify.setNotFoundHandler(async function(request, reply) {
	let error = boom.notFound(`Endpoint '${request.raw.url}' does not exist`)
	reply.type('application/json')
	reply.code(error.output.statusCode)
	reply.headers(error.output.headers)
	return error.output.payload
})

fastify.setErrorHandler(async function(error, request, reply) {
	console.error('setErrorHandler Error ->', error)
	reply.type('application/json')
	reply.code(error.output.statusCode)
	reply.headers(error.output.headers)
	return error.output.payload
})



// fastify.decorate('boom', function(error, reply) {
// 	if (error.data) _.defaults(error.output.payload, { attributes: error.data });
// 	reply.type('application/json')
// 	reply.code(error.output.statusCode)
// 	reply.headers(error.output.headers)
// 	console.log('error.output ->', error.output)
// 	// return error.output.payload
// 	return error
// })





import * as ajv from 'ajv'
declare module 'fastify' {
	interface FastifyError extends boom {
		validation?: ajv.ErrorObject[]
	}
	interface FastifyBoom<HttpResponse> {
		(error: FastifyError, reply: FastifyReply<HttpResponse>): FastifyError
	}
	interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {
		boom: FastifyBoom<HttpResponse>
		setErrorHandler(fn: (error: FastifyError, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void): Promise<any>
		decorate(name: 'boom', fn: FastifyBoom<HttpResponse>): FastifyInstance<HttpServer, HttpRequest, HttpResponse>
	}
}





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


