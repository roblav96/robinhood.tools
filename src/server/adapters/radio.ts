// 

import { IncomingMessage } from 'http'
import * as uws from 'uws'
import * as url from 'url'
import * as qs from 'querystring'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as R from '../../common/rambdax'
import * as Rx from '../../common/rxjs'
import clock from '../../common/clock'
import WebSocketClient from '../../common/websocket.client'
import Emitter from '../../common/emitter'
import fastify from '../api/fastify'



const PATH = 'radio'
const ADDRESS = `ws://${process.HOST}:${process.PORT}/${PATH}?${qs.stringify({ id: process.INSTANCE })}`

if (process.PRIMARY) {

	class WebSocketServer extends uws.Server {
		opens() {
			let opens = 0
			this.clients.forEach(function(client) {
				if (client.open) opens++;
			})
			return opens
		}
		find(id: string) {
			let found: uws.WebSocket
			this.clients.forEach(function(client) {
				if (found) return;
				if (client.id == id) found = client;
			})
			return found
		}
		send(ids: string[], message: string) {
			this.clients.forEach(function(client) {
				if (ids.includes(client.id)) {
					client.send(message)
				}
			})
		}
	}

	const wss = new WebSocketServer({
		server: fastify.server, path: PATH,
		verifyClient(incoming, next) {
			let host = incoming.req.headers['host']
			next(host == process.HOST)
		},
	})

	// wss.on('listening', function() { console.info('listening ->', wss.httpServer.address()) })
	wss.on('error', function(error) { console.error('wss.on Error ->', error) })

	wss.on('connection', function(this: WebSocketServer, client: uws.WebSocket, req: IncomingMessage) {
		client.open = false
		client.id = qs.parse(url.parse(req.url).query).id as string

		client.on('message', function(message: string) {
			if (message == 'pong') return;
			if (message == 'ping') return client.send('pong');
			if (message == '__onopen__') {
				client.open = true
				if (wss.opens() >= process.INSTANCES) {
					wss.broadcast('__onready__')
				}
				return
			}
			if (message.indexOf('__primary__') == 0) {
				message = message.slice('__primary__'.length)
				wss.send(['0'], message)
				return
			}
			wss.broadcast(message)
		})

		client.on('close', function(code, reason) {
			console.warn('onclose ->', code, '->', reason)
			client.open = false
			if (wss.clients.length < process.INSTANCES) {
				wss.broadcast('__onclose__')
			}
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
		connect: false,
		timeout: '1s',
		// verbose: true,
	})

	constructor() {
		super()

		// fastify.rxready.subscribe(() => this.socket.connect())
		setImmediate(() => {
			this.socket.connect()
		})

		this.socket.on('open', () => {
			this.rxopen.next(true)
			this.socket.send('__onopen__')
		})
		this.socket.on('close', () => {
			this.rxopen.next(false)
		})

		this.socket.on('message', (message: string) => {
			if (message == '__onready__') {
				return this.rxready.next(true)
			}
			if (message == '__onclose__') {
				return this.rxready.next(false)
			}
			let event = JSON.parse(message) as Radio.Event
			super.emit(event.name, ...event.args)
		})

	}

	emit(name: string, ...args: any[]) {
		this.socket.json({ name, args } as Radio.Event)
		return this
	}

	emitPrimary(name: string, ...args: any[]) {
		let event = JSON.stringify({ name, args } as Radio.Event)
		this.socket.send('__primary__' + event)
	}

	done(done: string) { this.emit(`${done}.${process.INSTANCE}`) }
	onAll(fn: (done: string, ...args: any[]) => any) {
		if (!fn.name) throw new Error('onAll parameter function must be named');
		this.on(fn.name, fn)
	}
	async emitAll(fn: (done: string, ...args: any[]) => any, ...args: any[]) {
		if (!fn.name) throw new Error('emitAll parameter function must be named');
		await this.rxready.toPromise()
		let alls = core.array.create(process.INSTANCES)
		let proms = alls.map(i => this.toPromise(`${fn.name}.${i}`))
		this.emit(fn.name, fn.name, ...args)
		await Promise.all(proms)
	}



	// event(event: Partial<Radio.Event>) {
	// 	event.sender = process.INSTANCE
	// 	this.socket.json(event)
	// 	return this
	// }

	// async everyone(name: string, ...args: any[]) {
	// 	await this.rxready.toPromise()
	// 	let ii = core.array.create(process.INSTANCES)
	// 	let proms = ii.map(i => this.toPromise(name))
	// 	this.emit(name, ...args)
	// 	await Promise.all(proms)
	// }

}

const radio = new Radio()
export default radio





declare global {
	namespace Radio {
		// type AllFn = (done: string, ...args: any[]) => any
		// interface Client extends WebSocket {
		// 	id: number
		// }
		interface Event<T = any> {
			name: string
			args: T[]
			// sender: number
		}
	}
}


