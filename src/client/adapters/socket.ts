// 
export * from '@/common/socket'
// 

import { WS } from '@/common/socket'
import WebSocketClient from '@/common/websocket.client'
import Emitter, { Event, Listener } from '@/common/emitter'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import clock from '@/common/clock'
import store from '@/client/store'
import * as security from './security'
import * as http from './http'



class Socket extends Emitter {

	private clients = [] as WebSocketClient[]
	discover() {
		return http.get('/websocket/discover').then((addresses: string[]) => {
			this.clients.forEach(v => v.destroy())
			this.clients.splice(0, Infinity, ...addresses.map((v, i) => {
				return new WebSocketClient(v, {
					query: security.headers,
				}).on('open', this.opensync, this).on('message', this.onmessage, this)
			}))
		})
	}

	private onmessage(message: string) {
		let event = JSON.parse(message) as Socket.Event
		console.log('event ->', event)
	}

	private opensync() {
		let total = this.clients.length
		let opens = this.clients.map(v => v.alive()).filter(v => v).length
		if (opens == total) this.sync();
	}

	private resync = _.debounce(this.sync, 1, { leading: false, trailing: true })
	private sync() {
		let action = WS.ACT + WS.SUBS + JSON.stringify(this.eventNames())
		this.clients.forEach(v => v.send(action))
	}

	// once() { return new Error('No can do...') as any }

	on(name: string, fn: Listener) {
		this.resync()
		return super.on(name, fn)
	}
	addListener(name: string, fn: Listener) { return this.on(name, fn) }
	off(name: string, fn: Listener) {
		this.resync()
		return super.off(name, fn)
	}
	removeListener(name: string, fn: Listener) { return this.on(name, fn) }

}
const socket = new Socket()
export default socket


