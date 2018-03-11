// 

import * as fastify from 'fastify'

declare module 'fastify' {

	interface FastifyRequest<HttpRequest> {
		headers?: Dict<string>
	}

}



