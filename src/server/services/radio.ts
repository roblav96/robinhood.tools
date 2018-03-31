// 

import * as core from '../../common/core'
import * as ee4 from '../../common/ee4'

import * as http from 'http'
import * as uws from 'uws'
import uWebSocket from '../../common/uwebsocket'
import fastify from '../api/fastify'



if (process.MASTER) {

	const wss = new uws.Server({
		path: 'radio',
		server: fastify.server,
		verifyClient(incoming, next) {
			let host = incoming.req.headers['host']
			// next(host.includes(HOST))
			next(true)
		},
	})

	wss.on('listening', function() { console.info('listening ->', this.httpServer.address()) })
	wss.on('error', function(error) {
		console.error('wss.on Error ->', error)
	})

	wss.on('headers', function(headers) {
		console.log('headers ->', headers)
	})

	wss.on('connection', function(socket: WebSocket, req: http.IncomingMessage) {
		if (!Array.isArray(socket.subs)) socket.subs = [];

		socket.on('message', function(message: string) {
			// console.log('SOCKET.SUBS ->', eyes.stringify(socket.subs))
			if (message == 'pong') return;
			if (message == 'ping') return socket.send('pong');
			if (message == '_onopen_') {
				if (wss.clients.length > process.INSTANCES) {
					wss.broadcast('_onready_')
				}
				return
			}
			if (message.indexOf(`{"e":"log"`) == 0) {
				// console.log('wss.clients ->', wss.clients)
				wss.clients.forEach(function(client) {
					// console.log('client.subs ->', eyes.stringify(client.subs))
				})
			}
			wss.broadcast(message)
		})

		socket.on('error', error => console.error('socket.on Error ->', error))

	})

}



class Radio extends ee4.EventEmitter {

	private _socket = new uWebSocket(`ws://127.0.0.1:${process.PORT - 1}/radio`, {
		autostart: false,
		verbose: true, // process.MASTER,
	})

	constructor() {
		super()
		fastify.after(function (error) {
			console.warn('after')
		})
		this._socket.on('open', () => {
			this._socket.send('_onopen_')
			super.emit('_onopen_')
		})
		this._socket.on('message', (message: Radio.Message) => {
			if ((message as any) == '_onready_') return super.emit('_onready_');
			message = JSON.parse(message as any)
			super.emit(message.e, message.d)
		})
	}

	emit(event: string, data?: any) {
		return !!this._socket.json({ e: event, d: data } as Radio.Message)
	}

}

export default new Radio()





declare global {
	interface WebSocket extends uws {
		subs: string[]
	}
	namespace Radio {
		type radio = Radio
		interface Message<T = any> {
			e: string
			i: number
			d?: T
		}
	}
}


