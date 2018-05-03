// 
export * from '@/common/socket'
// 

import { WS } from '@/common/socket'
import WebSocketClient from '@/common/websocket.client'
import Emitter, { Event, Listener } from '@/common/emitter'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import clock from '@/common/clock'
import qs from 'querystring'
import * as http from './http'



class Client extends WebSocketClient {

	constructor(
		private address: string,
		private onmessage: (message: Socket.Message) => void,
	) {
		super(address, {

		})
		this.sockette = new Sockette(this.url, {
			timeout: 1000,
			maxAttempts: Infinity,
			onopen: event => {
				console.info('onopen ->', event)
				this.ws = event.target as any
				clock.on('10s', this.heartbeat)
				socket.sync()
			},
			onclose: event => {
				console.warn('onclose ->', event.code, event.reason)
				clock.offListener(this.heartbeat)
				this.ws = null
			},
			onmessage: event => {
				let message = event.data as string
				if (message == 'pong') return;
				if (message == 'ping') return this.send('pong');
				console.log('client message ->', message)
				this.onmessage(JSON.parse(message))
			},
			onerror: event => {
				console.error(this.address, 'onerror Error ->', event)
			},
		})
	}

	json(data: any) {
		if (!this.alive) return;
		this.sockette.send(JSON.stringify(data))
	}
	send(message: string) {
		if (!this.alive) return;
		this.sockette.send(message)
	}

	close() {
		if (!this.alive) return;
		this.sockette.close()
	}

}



const socket = new class extends Emitter {

	clients = [] as Client[]
	discover() {
		return http.get('/websocket/discover', {
			retries: Infinity,
		}).then((addresses: string[]) => {
			this.clients.forEach(v => v.close())
			this.clients.splice(0, Infinity, ...addresses.map((v, i) => new Client(v, this.onmessage)))
		})
	}

	onmessage(message: Socket.Message) {
		console.log('this ->', this)
		console.log('message ->', message)
	}

	sync = _.throttle(this._sync, 100, { leading: false, trailing: true })
	private _sync() {
		let message = JSON.stringify({
			action: 'subs',
			subs: this.eventNames(),
		} as Socket.Message)
		this.clients.forEach(v => v.send(message))
	}

	on(name: string, fn: Listener) {
		this.sync()
		return super.on(name, fn)
	}
	addListener(...args) { return this.on(...args) }

}
export default socket


