// 

import * as http from 'http'
import * as _ from 'lodash'
import * as uws from 'uws'
import * as Rx from '../../common/rxjs'
import WebSocketClient from '../../common/websocket.client'
import Emitter from '../../common/emitter'



const HOST = process.HOST
const PORT = process.PORT - 1
const PATH = 'radio'
const ADDRESS = `ws://${HOST}:${PORT}/${PATH}`



class Radio extends Emitter {

	ready = new Rx.ReadySubject()
	socket = new WebSocketClient(ADDRESS, {
		autoStart: false,
		// verbose: process.MASTER,
		// verbose: true,
	})

	connect = _.once(() => this.socket.connect())

	constructor() {
		super()

		if (process.WORKER) setImmediate(this.connect);

		this.socket.on('open', () => {
			this.socket.send('_onopen_')
		})

		this.socket.on('message', (message: string) => {
			if (message == '_onready_') {
				return this.ready.next()
			}
			let event = JSON.parse(message) as Radio.Event
			super.emit(event.n, event.d)
		})

	}

	emit(name: string, data?: any) {
		this.socket.json({ n: name, d: data } as Radio.Event)
		return this
	}

}

const radio = new Radio()
export default radio



if (process.MASTER) {

	const wss = new uws.Server({
		host: HOST, port: PORT, path: PATH,
		verifyClient(incoming, next) {
			let host = incoming.req.headers['host']
			next(host == process.HOST)
		},
	})

	wss.once('listening', radio.connect)

	// wss.on('listening', function() { console.info('listening ->', wss.httpServer.address()) })
	wss.on('error', function(error) { console.error('wss.on Error ->', error) })

	wss.on('connection', function(client: Radio.Client, req: http.IncomingMessage) {

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

		client.on('error', function(error) {
			console.error('client.on Error ->', error)
		})

	})

}





declare global {
	namespace Radio {
		interface Client extends uws {

		}
		interface Event<T = any> {
			/** ▶ name */
			n: string
			/** ▶ data */
			d: T
		}
	}
}


