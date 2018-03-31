// 

import { IncomingMessage } from 'http'
import * as core from '../../common/core'
import * as uws from 'uws'
import * as ee4 from '../../common/ee4'
import uWebSocket from '../../common/uwebsocket'



let wss: uws.Server
const HOST = process.HOST
const PORT = process.PORT - 1
const PATH = 'radio'

if (process.MASTER) {

	wss = new uws.Server({
		host: HOST, port: PORT, path: PATH,
		verifyClient(incoming, next) {
			let host = incoming.req.headers['host']
			next(host == process.HOST)
		},
	})
	wss.on('listening', function() { console.info('listening ->', wss.httpServer.address()) })
	wss.on('error', function(error) { console.error('wss.on Error ->', error) })

	wss.on('connection', function(socket: uws.WebSocket, req: IncomingMessage) {
		if (!Array.isArray(socket.subs)) socket.subs = [];

		socket.on('message', function(message: string) {
			if (message == 'pong') return;
			if (message == 'ping') return socket.send('pong');
			if (message == '_onopen_') {
				if (wss.clients.length > process.INSTANCES) {
					wss.broadcast('_onready_')
				}
				return
			}
			wss.broadcast(message)
		})

		socket.on('error', function(error) { console.error('socket.on Error ->', error) })

	})

}



class Radio extends ee4.EventEmitter {

	socket = new uWebSocket(`ws://${HOST}:${PORT}/${PATH}`, {
		autoconnect: !process.MASTER,
		verbose: true, // process.MASTER,
	})

	constructor() {
		super()
		if (process.MASTER) wss.once('listening', () => this.socket.connect());
		this.socket.on('open', () => {
			this.socket.send('_onopen_')
			super.emit('_onopen_')
		})
		this.socket.on('message', (message: Radio.Message) => {
			if ((message as any) == '_onready_') return super.emit('_onready_');
			message = JSON.parse(message as any)
			super.emit(message.e, message.d)
		})
	}

	emit(event: string, data?: any) {
		return !!this.socket.json({ e: event, d: data } as Radio.Message)
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
	interface WebSocket extends uws {
		subs?: string[]
	}
}


