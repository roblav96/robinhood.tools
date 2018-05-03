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

	private onmessage(message: string) {
		let payload = JSON.parse(message) as Socket.Payload
		console.log('payload ->', payload)
	}

	private resync = _.throttle(this.sync, 100, { leading: false, trailing: true })
	private sync() {
		let payload = JSON.stringify({
			subs: this.eventNames(),
		} as Socket.Payload)
		this.clients.forEach(v => v.send(payload))
		// let message = WS.HASH + WS.SUBS + JSON.stringify(this.eventNames())
		// this.clients.forEach(v => v.send(message))
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
// console.log('socket ->', socket)



let emitter = onchange(new Emitter(), (idk) => console.log('idk ->', idk))
console.log('emitter ->', emitter)



// const socket = onchange(new Socket(), (idk) => console.log('idk ->', idk))
// console.log('socket ->', socket)
// export default socket





// import * as Vts from 'vue-property-decorator'
// import { mixins as Mixins } from 'vue-class-component'
// import Vue from 'vue'

// let watcher = new Vue({
// 	data: { socket },
// 	watch: {
// 		'socket.events': {
// 			handler(to, from) {
// 				console.log('from ->', from)
// 				console.log('to ->', to)
// 			},
// 			deep: true,
// 		}
// 	}
// })
// console.log('watcher ->', watcher)
// @Vts.Component
// class Watcher extends Vue {
// 	events = socket._events
// 	@Vts.Watch('events', { deep: true })
// 	fn(to, from) {
// 		console.log('from ->', from)
// 		console.log('to ->', to)
// 	}
// }
// console.info('Watcher ->', Watcher)
// console.dir(Watcher)
// let watcher = new Watcher()
// console.log('watcher ->', watcher)



// store.registerModule('socket', { state: socket })
// declare global { namespace Store { interface State { socket: any } } }
// store.watch(state => state.socket.events, function(to, from) {
// 	console.log('from ->', from)
// 	console.log('to ->', to)
// }, { deep: true })



// import { computed, observe, dispose } from 'hyperactiv'

// const obj = observe(socket._events)
// console.log('obj ->', obj)



setTimeout(function() {
	console.log('setTimeout')
	emitter.once('idk', function() {
		// console.log('idk')
	})
	setTimeout(function() {
		emitter.emit('idk', 'wut')
	}, 1000)
	setTimeout(function() {
		emitter.on('where', function() {

		})
	}, 2000)
	setTimeout(function() {
		emitter.off('where')
	}, 3000)
}, 1000)





