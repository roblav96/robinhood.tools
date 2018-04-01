// 

import { IncomingMessage } from 'http'
import * as _ from 'lodash'
import * as rx from 'rxjs'
import * as uws from 'uws'
import * as ee4 from '../../common/ee4'
import * as rxu from '../../common/rx.utils'
import WebSocketClient from '../../common/websocket.client'



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
		client.on('error', function(error) { console.error('socket.on Error ->', error) })

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

	})

}



class Radio extends ee4.EventEmitter {

	rxReady = new rxu.ReadySubject()
	socket = new WebSocketClient(`ws://${HOST}:${PORT}/${PATH}`, {
		autoconnect: false,
		// verbose: process.MASTER,
		// verbose: true,
	})

	constructor() {
		super()

		const _connect = _.once(() => this.socket.connect())
		if (process.MASTER) wss.once('listening', _connect);
		else setImmediate(_connect);

		this.socket.on('open', () => {
			this.socket.send('_onopen_')
			super.emit('_onopen_')
		})

		this.socket.on('message', (message: string) => {
			if (message == '_onready_') {
				this.rxReady.ready = true
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


