// 
export * from '@/common/socket'
// 

import { WS } from '@/common/socket'
import WebSocketClient from '@/common/websocket.client'
import Emitter, { Event, Listener } from '@/common/emitter'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as proxy from '@/common/proxy'
import clock from '@/common/clock'
import store from '@/client/store'
import * as security from './security'
import * as http from './http'



class Socket extends Emitter {

	// constructor() {
	// 	super(k => this.onsync(k))
	// 	// let keys = ['once', 'on', 'addListener', 'off', 'removeListener', 'offListener', 'removeAllListeners', 'offAll'] as KeysOf<Emitter>
	// 	// let keys = ['emit'] as KeysOf<Emitter>
	// 	// proxy.observe.apply(this, [keys, this.onsync])
	// }

	// onsync(key: string) {

	// }

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
		let event = JSON.stringify({
			action: 'sync', data: this.eventNames(),
		} as Socket.Event)
		this.clients.forEach(v => v.send(event))
	}



}
const socket = new Socket()
export default socket





// import * as bench from 'nanobench'
// bench('socket.emit -> native', function({ start, end }) {
// 	class Native extends Emitter {
// 		emit(...args) {
// 			super.emit(...args)
// 		}
// 	}
// 	const native = new Native()
// 	start()
// 	let i: number, len = 1000000
// 	for (i = 0; i < len; i++) {
// 		native.emit('hello', { hello: 'world' })
// 	}
// 	end()
// })
// bench('socket.emit -> proxy.proxy', function({ start, end }) {
// 	class ProxyProxy extends Emitter {
// 		constructor() {
// 			super(true)
// 		}
// 	}
// 	const proxyproxy = new ProxyProxy()
// 	// proxyproxy.on('__onproxy', function (method, property) {
// 	// 	console.log('method ->', method)
// 	// 	console.log('property ->', property)
// 	// })
// 	start()
// 	let i: number, len = 1000000
// 	for (i = 0; i < len; i++) {
// 		proxyproxy.emit('hello', { hello: 'world' })
// 	}
// 	end()
// })
// bench('socket.emit -> Object.assign', function({ start, end }) {
// 	class ObjectAssign extends Emitter {
// 		constructor() {
// 			super()
// 			let keys = ['emit'] as KeysOf<Emitter>
// 			proxy.observe.apply(this, [keys, this.onsync])
// 		}
// 		onsync(property: string) {

// 		}
// 	}
// 	const objectassign = new ObjectAssign()
// 	start()
// 	let i: number, len = 1000000
// 	for (i = 0; i < len; i++) {
// 		objectassign.emit('hello', { hello: 'world' })
// 	}
// 	end()
// })



