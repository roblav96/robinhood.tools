// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import * as uws from 'uws'
import fastify from '../fastify'



const wss = new uws.Server({
	host: '127.0.0.1',
	// host: process.DOMAIN,
	port: process.PORT + process.INSTANCES + process.INSTANCE,
	path: 'websocket/' + process.INSTANCE,
	// noServer: true,
	// server: fastify.server,
	verifyClient(incoming, next) {
		// console.info('incoming.req.headers ->')
		// eyes.inspect(incoming.req.headers)
		next(true)
	},
})

wss.on('listening', function(this: uws.Server) {
	// console.info('listening ->', this.httpServer.address())
	this.startAutoPing(3000, 'ping')
})

wss.on('connection', function(socket) {
	socket.on('message', function (message: string) {
		console.log('message ->', message)
	})
})

wss.on('error', function(error) {
	console.error('onerror Error ->', error)
})

export default wss




