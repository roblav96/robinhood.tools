// 

import { IncomingMessage } from 'http'
import * as _ from 'lodash'
import * as uws from 'uws'
import * as core from '../../common/core'
import * as Rx from '../../common/rxjs'
import clock from '../../common/clock'
import WebSocketClient from '../../common/websocket.client'
import Emitter from '../../common/emitter'



const host = process.HOST
const port = process.PORT - 1
const path = 'radio'
const address = `ws://${host}:${port}/${path}`

if (process.MASTER) {

	const wss = new uws.Server({
		host, port, path,
		verifyClient(incoming, next) {
			let host = incoming.req.headers['host']
			next(host == process.HOST)
		},
	})

	wss.httpServer.timeout = 10000
	wss.httpServer.keepAliveTimeout = 1000

	// wss.on('listening', function() { console.info('listening ->', wss.httpServer.address()) })
	wss.on('error', function(error) { console.error('wss.on Error ->', error) })

	wss.on('connection', function(client: Radio.Client, req: IncomingMessage) {

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

	wss.once('listening', function() { radio.socket.connect() })

}



class Radio extends Emitter {

	open = new Rx.ReadySubject()
	ready = new Rx.ReadySubject()

	socket = new WebSocketClient(address, {
		connect: process.WORKER,
		timeout: '1s',
		// verbose: true,
		// verbose: process.MASTER,
	})

	constructor() {
		super()

		this.socket.on('open', () => {
			this.open.next(true)
			this.socket.send('_onopen_')
		})
		this.socket.on('close', () => {
			this.open.next(false)
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

	job(name: string, data?: any) {
		if (!process.MASTER) return;
		let proms = core.workers().map(function(i) {
			return radio.toPromise(`${name}.${i}`)
		})
		radio.emit(name, data)
		return Promise.all(proms)
	}

}

const radio = new Radio()
export default radio





declare global {
	namespace Radio {
		interface Client extends uws {

		}
		interface Event<T = any> {
			/** ▶ name */
			n: string
			/** ▶ data */
			d: Data<T>
		}
		interface Data<T = any> {
			/**▶ from process.INSTANCE */
			fi: number
		}
	}
}


