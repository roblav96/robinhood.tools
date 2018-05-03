// 
export * from '@/common/socket'
// 

import { WS } from '@/common/socket'
import WebSocketClient from '@/common/websocket.client'
import Emitter, { Event, Listener } from '@/common/emitter'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import clock from '@/common/clock'
import jsonparse from 'fast-json-parse'
import * as security from './security'
import * as http from './http'



class Socket extends Emitter {

	private static query() {
		return security.headers()
	}

	private clients = [] as WebSocketClient[]
	discover() {
		return http.get('/websocket/discover', {
			retries: Infinity,
		}).then((addresses: string[]) => {
			this.clients.forEach(v => v.destroy())
			this.clients.splice(0, Infinity, ...addresses.map((v, i) => {
				return new WebSocketClient(v, {
					query: Socket.query,
				}).on('open', this.onopen).on('message', this.onmessage)
			}))
		})
	}

	private onopen = () => this.resync()

	private onmessage = (message: Socket.Message) => {
		message = JSON.parse(message as any)
		console.log('message ->', message)
	}

	resync = _.throttle(this.sync, 100, { leading: false, trailing: true })
	private sync() {
		console.log('this ->', this)
		let message = JSON.stringify({
			action: 'subs',
			subs: this.eventNames(),
		} as Socket.Message)
		this.clients.forEach(v => v.send(message))
	}

	// on(name: string, fn: Listener) {
	// 	this.resync()
	// 	return super.on(name, fn)
	// }
	// addListener(name: string, fn: Listener) { return this.on(name, fn) }
	// off(name: string, fn: Listener) {
	// 	this.resync()
	// 	return super.off(name, fn)
	// }
	// addListener(name: string, fn: Listener) { return this.on(name, fn) }

}
const socket = new Socket()
export default socket


