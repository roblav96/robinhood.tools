// 
export * from '@/common/socket'
// 

import { WS } from '@/common/socket'
import WebSocketClient from '@/common/websocket.client'
import Emitter, { Event, Listener } from '@/common/emitter'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import clock from '@/common/clock'
import * as security from './security'
import * as http from './http'



class Socket extends Emitter {

	private clients = [] as WebSocketClient[]
	discover() {
		return http.get('/websocket/discover', {
			retries: Infinity,
		}).then((addresses: string[]) => {
			this.clients.forEach(v => v.destroy())
			this.clients.splice(0, Infinity, ...addresses.map((v, i) => {
				return new WebSocketClient(v, {
					query: security.headers,
					heartbeat: '5s',
				}).on('open', this.sync, this).on('message', this.onmessage, this)
			}))
		})
	}

	private onmessage(message: Socket.Message) {
		message = JSON.parse(message as any)
		console.log('message ->', message)
	}

	private resync = _.throttle(this.sync, 100, { leading: false, trailing: true })
	private sync() {
		let message = `#${WS.ACT.SUBS}#${JSON.stringify(this.eventNames())}`
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


