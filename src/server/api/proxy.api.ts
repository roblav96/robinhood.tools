// 

import fastify from './fastify'
import * as boom from 'boom'
import * as http from '../adapters/http'



fastify.route({
	method: 'POST',
	url: '/api/proxy',
	handler: async function(request, reply) {
		if (!request.authed) throw boom.unauthorized('no way');

		let config = request.body as Http.RequestConfig
		let response = await http.request({
			method: config.method,
			url: config.url,
			retries: 3,
			isProxy: true,
		})
		console.log('response.body ->', response.body)
		return response.body

	},
})





// const handler = (async function(request, reply) {
// 	// if (!request.authed) throw boom.unauthorized();

// 	let error = new errors.Unauthorized()
// 	console.log('error ->', error)
// 	throw error

// 	let config = request.body as Http.RequestConfig
// 	let response = await http.request({
// 		method: config.method,
// 		url: config.url,
// 		retries: 3,
// 		isProxy: true,
// 	})
// 	console.log('response.body ->', response.body)
// 	return response.body

// })

// class Handler {
// 	constructor(private _handler: (request, reply) => Promise<any>) {
// 		return function(request, reply) {
// 			return Promise.resolve().then(function() {
// 				return _handler(request, reply)
// 			}).catch(function(error) {
// 				console.error('Handler Error ->', error)
// 				throw error
// 			})
// 		}
// 	}
// }

// console.log('handler ->', handler)





// if (!request.authed) {
// 	// reply.code(401)
// 	throw boom.illegal('oh nooo')
// 	// let error = boom.unauthorized('oh nooo')
// 	// console.log('error ->', error)
// 	// reply.type('application/json')
// 	// reply.code(error.output.statusCode)
// 	// reply.headers(error.output.headers)
// 	// throw error.output.payload
// }

// fastify.post('/api/proxy', {

// }, async function(request, reply) {
// 	if (!request.authed) throw boom.unauthorized();
// 	let config = request.body as Http.RequestConfig
// 	let response = await http.request({
// 		method: config.method,
// 		url: config.url,
// 		retries: 3,
// 		isProxy: true,
// 	})
// 	console.log('response.body ->', response.body)
// 	return response.body
// })


