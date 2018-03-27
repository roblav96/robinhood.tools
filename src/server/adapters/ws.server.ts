// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import * as uws from 'uws'
import fastify from '../fastify'



const wss = new uws.Server({
	path: 'websocket/' + process.INSTANCE,
	server: fastify.server,
	verifyClient(incoming, next) {
		next(incoming.req.headers['origin'] == process.DOMAIN)
	},
})

wss.on('connection', function(socket) {
	socket.on('message', function(message: string) {
		if (message == 'pong') return;
		if (message == 'ping') return socket.send('pong');
		this.close(1003, 'Sending messages via the client not allowed!')
	})
})

wss.on('error', function(error) {
	console.error('onerror Error ->', error)
})

export default wss




