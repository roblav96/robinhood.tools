// 

export * from '@/common/socket'
import WebSocketClient from '@/common/websocket.client'
import Emitter, { Event, Listener } from '@/common/emitter'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as proxy from '@/common/proxy'
import * as security from './security'
import * as http from './http'



class Socket extends Emitter {

	// private eventsCount = 0
	// constructor() {
	// 	super()
	// 	return proxy.observe<Socket>(this, (method, property) => {
	// 		if (property == '_eventsCount' && this._eventsCount != this.eventsCount) {
	// 			this.eventsCount = this._eventsCount
	// 			if (this.ready()) this.resync();
	// 		}
	// 	})
	// }

	constructor() {
		super()
		return proxy.observe<Socket>(this, (method, property) => {
			if (property == '_events' && this.ready()) {
				console.log('_events ->', 'resync')
				this.resync()
			}
		})
	}

	private clients = [] as WebSocketClient[]
	ready() {
		let alives = this.clients.map(v => v.alive()).filter(v => v).length
		return alives == this.clients.length
	}

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
		if (this.ready()) {
			console.log('opensync ->', 'resync')
			this.resync()
		}
	}

	private resync = _.debounce(this.sync, 100, { leading: false, trailing: true })
	private sync() {
		let event = JSON.stringify({
			action: 'sync', subs: this.eventNames(),
		} as Socket.Event)
		console.log('sync ->', event)
		this.clients.forEach(v => v.send(event))
	}

}
const socket = new Socket()
export default socket





// console.info('socket ->', socket)
// console.dir(socket)
// setTimeout(function() {
// 	console.log('setTimeout')
// 	socket.once('idk', function() {
// 		console.log('idk')
// 	})
// 	socket.resync()
// 	setTimeout(function() {
// 		socket.emit('idk', 'wut')
// 		socket.opensync()
// 	}, 1000)
// 	setTimeout(function() {
// 		socket.on('where', function() {

// 		})
// 	}, 2000)
// 	setTimeout(function() {
// 		socket.off('where')
// 	}, 3000)
// }, 1000)





// import * as bench from 'nanobench'
// bench('socket.emit -> native', function({ start, end }) {
// 	start()
// 	let i: number, len = 1000000
// 	for (i = 0; i < len; i++) {
// 		socket.emit('hello', { hello: 'world' })
// 	}
// 	end()
// })
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
// bench('socket.emit -> proxy', function({ start, end }) {
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



