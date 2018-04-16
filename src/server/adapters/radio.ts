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
import * as msgpack from '../../common/msgpack'
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
			next(host == process.HOST)
		},
	})

	// wss.on('listening', function() { console.info('listening ->', wss.httpServer.address()) })
	wss.on('error', function(error) { console.error('wss.on Error ->', error) })

	wss.on('connection', function(client: uws.WebSocket, req: IncomingMessage) {
		client.isopen = false
		client.uuid = qs.parse(url.parse(req.url).query).uuid as string

		client.on('message', function(message: string) {
			if (message == 'pong') return;
			if (message == 'ping') return client.send('pong');
			console.log('message ->', message)
			if (message == '__onopen__') {
				client.isopen = true
				if (wss.count() >= process.INSTANCES) {
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
			if (code != 1000) console.warn('onclose ->', code, '->', reason);
			client.isopen = false
			if (wss.clients.length < process.INSTANCES) {
				wss.broadcast('__onclose__')
			}
		})

		client.on('error', function(error) {
			console.error('client.on Error ->', error)
		})

	})

}



const sock = new Sockette(ADDRESS, {
	onopen() {
		console.log('open')
	},
})
console.log('sock ->', sock)



class Radio extends Emitter<string, any> {

	rxopen = new Rx.ReadySubject()
	rxready = new Rx.ReadySubject()

	socket = new WebSocketClient(ADDRESS, {
		connect: false,
		timeout: '1s',
		// silent: true,
		verbose: true,
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
		this.socket.json({ name, args } as Radio.Event)
		
		let event = { name, args } as Radio.Event
		console.log('event ->', event)

		let encoded = msgpack.encode(event)
		console.log('encoded ->', encoded)
		// console.log('encoded.toString(hex) ->', encoded.toString('hex'))

		// let decoded = msgpack.parse()

		// this.socket.binary(encoded as any)

		return true
	}
	emitPrimary(name: string, ...args: any[]) {
		let event = JSON.stringify({ name, args } as Radio.Event)
		this.socket.send('__primary__' + event)
	}
	emitFn(fn: Function, ...args: any[]) {
		this.emit(fn.name, ...args)
	}

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
	done(done: string) {
		this.emit(`${done}.${process.INSTANCE}`)
	}
	donePrimary(done: string) {
		this.emitPrimary(`${done}.${process.INSTANCE}`)
	}

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


