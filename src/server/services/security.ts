// 

import * as eyes from 'eyes'
import * as clc from 'cli-color'
import * as _ from 'lodash'
import * as common from '../../common'

import * as http from 'http'
import * as fastify from 'fastify'
import * as forge from 'node-forge'



// export function docHmac(doc: Partial<Security.Doc>, prime: string) {
// let message = doc.uuid + doc.bytes
export function docHmac(uuid: string, bytes: string, hostname: string, prime: string) {
	// console.log('docHmac', 'uuid', uuid, 'bytes', bytes, 'hostname', hostname, 'prime', prime)
	return common.security.hmac(uuid + bytes + hostname, prime)
}



export function reqip(request: fastify.FastifyRequest<http.IncomingMessage>) {
	if (request.headers['x-forwarded-for']) return request.headers['x-forwarded-for'];
	if (request.headers['x-real-ip']) return request.headers['x-real-ip'];
	if (request.req.connection.remoteAddress) return request.req.connection.remoteAddress;
	if (request.req.socket.remoteAddress) return request.req.socket.remoteAddress;
	return null
}


