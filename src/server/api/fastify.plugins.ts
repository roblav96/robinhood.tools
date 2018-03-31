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


