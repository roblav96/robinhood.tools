// 

export * from '@/common/socket'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as security from '@/client/adapters/security'
import * as http from '@/client/adapters/http'
import * as qs from 'querystring'
import Sockette from 'sockette'
import WebSocketClient from '@/common/websocket.client'
import Emitter from '@/common/emitter'
import clock from '@/common/clock'



class Client extends Emitter<'open' | 'close' | 'error' | 'message'> {

	private static readonly codes = {
		1000: 'Normal',
		1001: 'Going Away',
		1002: 'Protocol Error',
		1003: 'Unsupported',
		1005: 'No Status',
		1006: 'Abnormal',
		1007: 'Unsupported Data',
		1008: 'Policy Violation',
		1009: 'Too Large',
	}

	private static get options() {
		return _.clone({
			query: null as () => object,
			timeout: 1000,
			maxAttempts: Infinity,
			verbose: false,
		})
	}

	private sockette: Sockette
	constructor(
		private address: string,
		private options = {} as Partial<typeof Client.options>,
	) {
		super()
		_.defaults(this.options, Client.options)
		clock.on('5s', this.onping, this)
		if (this.options.query) this.address = `${this.address}?${qs.stringify(this.options.query())}`;
		this.sockette = new Sockette(this.address, {
			timeout: this.options.timeout,
			maxAttempts: this.options.maxAttempts,
			onopen: this.onopen,
			onclose: this.onclose,
			onerror: this.onerror,
			onmessage: this.onmessage,
			onreconnect: security.cookies,
		})
	}

	alive = false
	send(message: string) {
		if (!this.alive) return;
		this.sockette.send(message)
	}
	destroy() {
		this.offAll()
		this.sockette.close(1000)
		this.sockette = null
		clock.offListener(this.onping, this)
	}

	private onping() { this.send('ping') }
	private onopen = (event: Event) => {
		if (this.options.verbose) console.info(this.address, 'onopen ->', event);
		this.alive = true
		this.emit('open', event)
	}
	private onclose = (event: CloseEvent) => {
		if (this.options.verbose) {
			let code = (Client.codes[event.code]) || event.code
			if (!Number.isFinite(code)) code += ` (${event.code})`;
			console.warn(this.address, 'onclose ->', code, event.reason)
		}
		this.alive = false
		this.emit('close', _.pick(event, ['code', 'reason']))
	}
	private onerror = (error: ErrorEvent) => {
		if (this.options.verbose) console.error(this.address, 'onerror Error ->', error.message || error);
		this.alive = false
		this.emit('error', error)
	}
	private onmessage = (event: MessageEvent) => {
		let message = event.data as string
		if (message == 'pong') return;
		if (message == 'ping') return this.send('pong');
		if (this.options.verbose) console.log(this.address, 'onmessage ->', message);
		this.emit('message', message)
	}

}



class Socket extends Emitter {

	constructor() {
		super()
		clock.on('1s', this.sync, this)
	}

	private clients = [] as Client[]
	ready() {
		let alives = this.clients.map(v => v.alive).filter(v => v).length
		return alives == this.clients.length
	}

	discover() {
		return http.get('/websocket/discover', { retries: Infinity }).then((addresses: string[]) => {
			security.cookies()
			this.clients.forEach(v => v.destroy())
			this.clients.splice(0, Infinity, ...addresses.map((v, i) => {
				return new Client(v, {
					// verbose: true,
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
		// console.log('message ->', message)
		let event = JSON.parse(message) as Socket.Event
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



