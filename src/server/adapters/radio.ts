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
const ADDRESS = `ws://${process.HOST}:${process.PORT}/${PATH}?${qs.stringify({ instance: process.INSTANCE })}`

if (process.PRIMARY) {

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

		client.on('close', function(code, reason) {
			console.warn('onclose ->', code, '->', reason)
			if (wss.clients.length < process.INSTANCES) {
				wss.broadcast('__onclose')
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
		connect: !process.PRIMARY,
		timeout: '1s',
	})

	constructor() {
		super()

		if (process.PRIMARY) {
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
				return this.rxready.next(true)
			}
			if (message == '__onclose') {
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



	onAll(fn: (done: string, ...args: any[]) => any) {
		if (!fn.name) throw new Error('onAll input function must be named');
		this.on(fn.name, fn)
	}

	async emitAll(fn: (done: string, ...args: any[]) => any, ...args: any[]) {
		if (!fn.name) throw new Error('emitAll input function must be named');
		await this.rxready.toPromise()
		let all = core.array.create(process.INSTANCES)
		await Promise.all(all.map(i => {
			let done = `${fn.name}.${i}`
			let prom = this.toPromise(done)
			this.emit(fn.name, done, ...args)
			return prom
		}))
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
		interface Client extends uws {
			instance: number
		}
		interface Event<T = any> {
			name: string
			args: T[]
			// sender: number
		}
	}
}


