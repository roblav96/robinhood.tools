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
	// wss.on('listening', function() { console.info('listening ->', wss.httpServer.address()) })
	wss.on('error', function(error) { console.error('wss.on Error ->', error) })

	wss.on('connection', function(client: Radio.Client, req: IncomingMessage) {
		if (!Array.isArray(client.subs)) client.subs = [];

		client.on('message', function(message: string) {
			if (message == 'pong') return;
			if (message == 'ping') return client.send('pong');
			if (message == '_onopen_') {
				if (wss.clients.length > process.INSTANCES) {
					wss.broadcast('_onready_')
				}
				return
			}
			wss.broadcast(message)
		})

		client.on('error', function(error) { console.error('socket.on Error ->', error) })

	})

}



class Radio extends ee4.EventEmitter {

	socket = new uWebSocket(`ws://${HOST}:${PORT}/${PATH}`, {
		autoconnect: !process.MASTER,
		// verbose: process.MASTER,
		// verbose: true,
	})

	constructor() {
		super()
		if (process.MASTER) wss.once('listening', () => this.socket.connect());
		this.socket.on('open', () => {
			this.socket.send('_onopen_')
			super.emit('_onopen_')
		})
		this.socket.on('message', (message: string) => {
			if (message == '_onready_') {
				super.emit('_onready_')
				return
			}
			let event = JSON.parse(message) as Radio.Event
			super.emit(event.e, event.d)
		})
	}

	emit(event: string, data?: any) {
		return !!this.socket.json({ e: event, d: data } as Radio.Event)
	}

}

export default new Radio()





declare global {
	namespace Radio {
		interface Client extends uws {
			subs: string[]
		}
		interface Event<T = any> {
			/** ▶ event name */
			e: string
			/** ▶ data */
			d: T
		}
	}
}


