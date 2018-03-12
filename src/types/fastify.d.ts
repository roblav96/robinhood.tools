// 

import * as fastify from 'fastify'

declare module 'fastify' {

	interface FastifyRequest<HttpRequest> {
		headers?: Dict<string>
	}

	interface FastifyReply<HttpResponse> {
		getHeader: (key: string) => string
		hasHeader: (key: string) => boolean
	}

}



