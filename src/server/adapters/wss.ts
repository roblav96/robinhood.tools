// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import * as uws from 'uws'
import fastify from '../fastify'



const wss = new uws.Server({
	noServer: true,
	server: fastify.server,
})

const onmessage = function(this: uws, message: string) {

}

wss.on('connection', function(socket) {
	console.info('socket ->')
	eyes.inspect(socket)
	socket.on('message', onmessage)
})

wss.on('error', function(error) {
	console.error('onerror Error ->', error)
})

export default wss





// declare module 'fastify' {
// 	interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {
// 		wss: uws.Server
// 	}
// }






