// 

export * from '@/common/socket'
import WebSocketClient from '@/common/websocket.client'
import Emitter from '@/common/emitter'
import clock from '@/common/clock'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as proxy from '@/common/proxy'
import * as security from './security'
import * as http from './http'



class Socket extends Emitter {

	constructor() {
		super()
		clock.on('1s', this.sync, this)
	}

	private clients = [] as WebSocketClient[]
	ready() {
		let alives = this.clients.map(v => v.alive()).filter(v => v).length
		return alives == this.clients.length
	}

	discover() {
		return http.get('/websocket/discover', { retries: Infinity }).then((addresses: string[]) => {
			this.clients.forEach(v => v.destroy())
			this.clients.splice(0, Infinity, ...addresses.map((v, i) => {
				return new WebSocketClient(v, {
					query: security.headers,
				}).on('open', this.onopen, this).on('close', this.onclose, this).on('message', this.onmessage, this)
			}))
		}).catch(error => console.error('discover Error ->', error))
	}

	private onopen() {
		this.strsubs = ''
		if (!this.ready()) return;
		this.emit('ready')
	}
	private onclose() {
		this.strsubs = ''
	}

	private strsubs = ''
	private sync() {
		if (!this.ready()) return;
		let subs = this.eventNames()
		let strsubs = JSON.stringify(subs)
		if (this.strsubs == strsubs) return;
		this.strsubs = strsubs
		this.send({ action: 'sync', subs })
	}

	private onmessage(message: string) {
		let event = JSON.parse(message) as Socket.Event
		// console.log('event ->', event)
		this.emit(event.name, event.data)
	}

	send(event: Partial<Socket.Event>) {
		// console.log('send ->', event)
		let message = JSON.stringify(event)
		this.clients.forEach(v => v.send(message))
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



