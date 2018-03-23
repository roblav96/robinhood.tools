// 

import * as _fastify from 'fastify'



declare module 'fastify' {
	export interface FastifyRequest<HttpRequest> {
		headers?: Dict<string>
	}
	export interface FastifyReply<HttpResponse> {
		getHeader: (key: string) => string
		hasHeader: (key: string) => boolean
	}
	export interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {
		register<T extends RegisterOptions<HttpServer, HttpRequest, HttpResponse>>(plugin: Plugin<HttpServer, HttpRequest, HttpResponse, T>, error?: (error: Error) => void): FastifyInstance<HttpServer, HttpRequest, HttpResponse>
		register<T extends RegisterOptions<HttpServer, HttpRequest, HttpResponse>>(plugin: Plugin<HttpServer, HttpRequest, HttpResponse, T>, opts?: T, error?: (error: Error) => void): FastifyInstance<HttpServer, HttpRequest, HttpResponse>
	}
}


