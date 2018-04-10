// 

import { IncomingMessage } from 'http'
import * as _ from '../../common/lodash'
import * as uws from 'uws'
import * as url from 'url'
import * as qs from 'querystring'
import * as core from '../../common/core'
import * as Rx from '../../common/rxjs'
import clock from '../../common/clock'
import WebSocketClient from '../../common/websocket.client'
import Emitter from '../../common/emitter'
import fastify from '../api/fastify'



const PATH = 'radio'
const ADDRESS = `ws://${process.HOST}:${process.PORT}/${PATH}?${qs.stringify({ instance: process.INSTANCE })}`

if (process.MASTER) {

	const wss = new uws.Server({
		server: fastify.server, path: PATH,
		verifyClient(incoming, next) {
			let host = incoming.req.headers['host']
			next(host == process.HOST)
		},
	})

	// wss.on('listening', function() { console.info('listening ->', wss.httpServer.address()) })
	wss.on('error', function(error) { console.error('wss.on Error ->', error) })

	wss.on('connection', function(client: Radio.Client, req: IncomingMessage) {
		client.instance = Number.parseInt(qs.parse(url.parse(req.url).query).instance as any)

		client.on('message', function(message: string) {
			if (message == 'pong') return;
			if (message == 'ping') return client.send('pong');
			if (message == '__onopen') {
				if (wss.clients.length >= process.INSTANCES) {
					wss.broadcast('__onready')
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



class Radio extends Emitter<string, any> {

	rxopen = new Rx.ReadySubject()
	rxready = new Rx.ReadySubject()

	socket = new WebSocketClient(ADDRESS, {
		connect: process.WORKER,
		timeout: '1s',
	})

	constructor() {
		super()

		if (process.MASTER) {
			fastify.rxready.subscribe(() => this.socket.connect())
		}

		this.socket.on('open', () => {
			this.rxopen.next(true)
			this.socket.send('__onopen')
		})
		this.socket.on('close', () => {
			this.rxopen.next(false)
		})

		this.socket.on('message', (message: string) => {
			if (message == '__onready') {
				return this.rxready.next()
			}
			let event = JSON.parse(message) as Radio.Event
			super.emit(event.name, ...event.args)
		})

	}

	event(event: Partial<Radio.Event>) {
		event.sender = process.INSTANCE
		this.socket.json(event)
		return this
	}

	emit(name: string, ...args: any[]) {
		return this.event({ name, args })
	}

	// job(name: string, data?: Radio.Data) {
	// 	if (!process.PRIMARY) return;
	// 	let proms = core.workers().map(function(i) {
	// 		return radio.toPromise(`${name}.${i}`)
	// 	})
	// 	radio.emit(name, data)
	// 	return Promise.all(proms)
	// }

}

const radio = new Radio()
export default radio





declare global {
	namespace Radio {
		interface Client extends uws {
			instance: number
		}
		interface Event<T = any> {
			name: string
			args: T[]
			sender: number
			master: boolean
			worker: boolean
		}
	}
}


