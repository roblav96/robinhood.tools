// 

import * as eyes from 'eyes'
import * as util from 'util'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as ee4 from '../../common/ee4'

import * as http from 'http'
import * as net from 'net'
import * as uws from 'uws'
import uWebSocket from '../../common/uwebsocket'



const HOST = '127.0.0.1'
const PORT = process.PORT - 1
const PATH = 'radio'
const ADDRESS = 'ws://' + HOST + ':' + PORT + '/' + PATH

if (process.MASTER) {

	class uWebSocketServer extends uws.Server {
		// handleUpgrade(req: http.IncomingMessage, socket: net.Socket, upgrade: ArrayBuffer, next: (client: uws) => void) {
		// 	// console.log('req ->', eyes.stringify(req))
		// 	// console.log('socket ->', eyes.stringify(socket))
		// 	// console.log('upgrade ->', eyes.stringify(upgrade))
		// 	// console.log('next ->', eyes.stringify(next))
		// 	// socket.subs = ['AWESOME SOCKET!']
		// 	next((client => {
		// 		console.log('client ->', client)
		// 		next.apply(this, [client])
		// 	}) as any)
		// 	super.handleUpgrade(req, socket, upgrade, next)
		// }
	}

	const wss = new uWebSocketServer({
		host: HOST, port: PORT, path: PATH,
		verifyClient(incoming, next) {
			let host = incoming.req.headers['host']
			if (host != HOST) {
				// console.log('wss.httpServer ->', wss.httpServer)
				// console.log('incoming.req.headers ->', incoming.req.headers)
				// console.log('incoming.req.client ->', incoming.req.client)
				// console.log('incoming.req.socket ->', incoming.req.socket)
			}
			next(host.includes(HOST))
		},
	})

	// wss.on('listening', function(this: uws.Server) { console.info('listening ->', this.httpServer.address()) })
	wss.on('error', function(this: uws.Server, error) {
		console.error('wss.on Error ->', error)
	})

	wss.on('headers', function(this: uws.Server, headers) {
		console.log('headers ->', headers)
	})

	wss.on('connection', function(socket) {
		if (!Array.isArray(socket.subs)) socket.subs = ['nope :('];

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

	private _socket = new uWebSocket(ADDRESS, {
		startdelay: 1,
		verbose: false, // process.MASTER,
	})

	constructor() {
		super()
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
	namespace Radio {
		type radio = Radio
		interface Message<T = any> {
			e: string
			i: number
			d?: T
		}
	}
}

declare module 'uws' {
	export interface WebSocket extends uws {
		subs: string[]
	}
}




