// 

import * as http from 'http'
import * as fastify from 'fastify'



declare module 'fastify' {
	interface FastifyRequest<HttpRequest> { // = http.IncomingMessage> {
		headers: Dict<string>
	}
	interface FastifyReply<HttpResponse> { // = http.ServerResponse> {
		getHeader: (key: string) => string
		hasHeader: (key: string) => boolean
	}
	interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {
		register<T extends RegisterOptions<HttpServer, HttpRequest, HttpResponse>>(plugin: Plugin<HttpServer, HttpRequest, HttpResponse, T>, error?: (error: Error) => void): FastifyInstance<HttpServer, HttpRequest, HttpResponse>
		register<T extends RegisterOptions<HttpServer, HttpRequest, HttpResponse>>(plugin: Plugin<HttpServer, HttpRequest, HttpResponse, T>, opts?: T, error?: (error: Error) => void): FastifyInstance<HttpServer, HttpRequest, HttpResponse>
	}
}


