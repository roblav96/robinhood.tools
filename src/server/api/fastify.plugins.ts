// 

import fastify from './fastify'



import * as cors from 'cors'
fastify.use(cors({ origin: process.DOMAIN }))



import * as cookie from 'cookie'
fastify.register(require('fastify-cookie'), error => { if (error) console.error('fastify-cookie Error ->', error); })
declare module 'fastify' {
	interface FastifyRequest<HttpRequest> { cookies: Dict<string> }
	interface FastifyReply<HttpResponse> { setCookie: (name: string, value: string, opts: cookie.CookieSerializeOptions) => FastifyReply<HttpResponse> }
}







// import wss from '../adapters/wsserver'
// fastify.register(function(fastify, opts, next) {
// 	fastify.decorate('wss', wss)
// 	fastify.addHook('onClose', function(fastify, done) {
// 		fastify.wss.close(done)
// 	})
// 	next()
// })
// declare module 'fastify' { interface FastifyInstance { wss: typeof wss } }



// import * as products from '../watchers/products'
// fastify.register(function(fastify, opts, next) {
// 	products.register(next)
// })



// fastify.register(function(instance, opts, next) {
// 	instance.decorate('boom', boom)
// 	console.log('instance.decorate')
// 	next()
// }, error => { if (error) console.error('fastify-boom Error ->', error); })
// declare module 'fastify' {
// 	interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {
// 		boom: typeof boom
// 		setNotFoundHandler(fn: (request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void): Promise<any>
// 		setErrorHandler(fn: (error: boom & { validation?: ajv.ErrorObject[] }, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void): Promise<any>
// 	}
// }



// declare global {
// 	type Fastify = typeof fastify
// 	type FastifyInstance = Fastify.FastifyInstance
// 	type FastifyRegisterOptions = Fastify.RegisterOptions<http.Server, http.IncomingMessage, http.ServerResponse>
// 	type FastifyMiddleware = Fastify.FastifyMiddleware<http.Server, http.IncomingMessage, http.ServerResponse>
// 	type FastifyRequest = Fastify.FastifyRequest<http.IncomingMessage>
// 	type FastifyReply = Fastify.FastifyReply<http.ServerResponse>
// 	type FastifyRouteHandler = (this: Fastify.FastifyInstance, request: FastifyRequest, reply: FastifyReply) => Promise<any>
// }


