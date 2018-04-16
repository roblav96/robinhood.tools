// 

import { IncomingMessage } from 'http'
import * as uws from 'uws'
import * as url from 'url'
import * as qs from 'querystring'
import * as Sockette from 'sockette'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as R from '../../common/rambdax'
import * as Rx from '../../common/rxjs'
import clock from '../../common/clock'
import WebSocketClient from '../../common/websocket.client'
import WebSocketServer from './websocket.server'
import Emitter from '../../common/emitter'
import fastify from '../api/fastify'



const PATH = 'radio'
const ADDRESS = `ws://${process.HOST}:${process.PORT}/${PATH}?${qs.stringify({ uuid: process.INSTANCE })}`

if (process.PRIMARY) {

	const wss = new WebSocketServer({
		server: fastify.server, path: PATH,
		verifyClient(incoming, next) {
			let host = incoming.req.headers['host']
			next(host == `${process.HOST}:${process.PORT}`)
		},
	})

	// wss.on('listening', function() { console.info('listening ->', wss.httpServer.address()) })
	wss.on('error', function(error) { console.error('wss.on Error ->', error) })

	wss.on('connection', function(client: uws.WebSocket, req: IncomingMessage) {
		client.alive = false
		client.uuid = qs.parse(url.parse(req.url).query).uuid as string

		client.on('message', function(message) {
			// console.log('message ->', message)
			if (core.string.is(message)) {
				if (message == 'pong') return;
				if (message == 'ping') return client.send('pong');
				if (message == '__onopen__') {
					client.alive = true
					if (wss.getSize() >= process.INSTANCES) {
						wss.broadcast('__onready__')
					}
					return
				}
				if (message.indexOf('__primary__') == 0) {
					message = message.slice('__primary__'.length)
					wss.sendTo(['0'], message)
					return
				}

			} else {
				console.log('message ->', message)
				// let decoded = msgpack.decode(message)
				// console.log('decoded ->', decoded)
			}

			// console.log('message ->', message)
			wss.broadcast(message)

		})

		client.on('close', function(code, reason) {
			if (code != 1000) console.warn('onclose ->', code, '->', reason);
			client.alive = false
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
		timeout: '10s',
		// verbose: true,
	})

	constructor() {
		super()

		fastify.rxready.subscribe(() => this.socket.connect())

		this.socket.on('open', () => {
			this.rxopen.next(true)
			this.socket.send('__onopen__')
		})
		this.socket.on('close', () => {
			this.rxopen.next(false)
		})

		this.socket.on('message', (message: string) => {
			console.log('message ->', message)
			if (message == '__onready__') {
				return this.rxready.next(true)
			}
			if (message == '__onclose__') {
				return this.rxready.next(false)
			}
			// let event = msgpack.decode(message) as Radio.Event
			let event = JSON.parse(message) as Radio.Event
			super.emit(event.name, ...event.args)
		})

	}

	emit(name: string, ...args: any[]) {
		console.log('args.length ->', args.length)
		console.log('{ name, args } ->', { name, args })
		this.socket.binary({ name, args } as Radio.Event)
	}
	emitPrimary(name: string, ...args: any[]) {
		this.socket.binary({ primary: true, name, args } as Radio.Event)
	}

	done(done: string) { this.emit(`${done}.${process.INSTANCE}`) }
	donePrimary(done: string) { this.emitPrimary(`${done}.${process.INSTANCE}`) }
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

	// emitFn(fn: Function, ...args: any[]) {
	// 	this.emit(fn.name, ...args)
	// }

}

const radio = new Radio()
export default radio





declare global {
	namespace Radio {
		interface Event<T = any> {
			name: string
			args: T[]
			primary: boolean
		}
	}
}





// const sock = new Sockette(ADDRESS, {
// 	onopen(event) {
// 		console.log('open', event)
// 	},
// })
// console.log('sock ->', sock)

// fastify.rxready.subscribe(function() {
// 	const ws = new Sockette(ADDRESS, {
// 		timeout: 5e3,
// 		maxAttempts: 10,
// 		onopen: e => console.log('Connected!', e),
// 		onmessage: e => console.log('Received:', e),
// 		onreconnect: e => console.log('Reconnecting...', e),
// 		onmaximum: e => console.log('Stop Attempting!', e),
// 		onclose: e => console.log('Closed!', e),
// 		onerror: e => console.log('Error:', e)
// 	})
// 	console.log('ws ->', ws)
// })


