// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import * as WebSocket from 'uws'
import * as ee3 from 'eventemitter3'
import * as utils from '../services/utils'
import ticks from '../services/ticks'



const PATH = 'radio'
const PORT = process.PORT - 1
const ADDRESS = 'ws://localhost:' + PORT + '/' + PATH

if (process.MASTER) {

	const wss = new WebSocket.Server({
		path: PATH, port: PORT,
		verifyClient(incoming) {
			return incoming.req.headers['host'] == 'localhost'
		},
	})

	wss.on('connection', function(client) {
		client.on('message', function(message: string) {
			wss.clients.forEach(function(v) { v.send(message) })
		})
	})

	wss.on('error', function(error) {
		console.error('uws Server Error ->', error)
	})

}



// class uWebSocket extends ee3.EventEmitter<keyof typeof uWebSocket.events> {
type uWebSocketOptions = typeof uWebSocket.options
interface uWebSocket extends uWebSocketOptions { }
class uWebSocket extends WebSocket {

	static readonly events = {
		open: 'open',
		close: 'close',
		error: 'error',
		message: 'message',
		ping: 'ping',
		pong: 'pong',
	}

	static get options() {
		return _.clone({
			autoreconnect: true,
			autotimeout: 3000,
			heartrate: ticks.T5,
			verbose: false,
		})
	}

	constructor(
		public address: string,
		public options = {} as Partial<typeof uWebSocket.options>,
	) {
		super(address)
		_.defaults(this.options, uWebSocket.options)
		console.info('this.options ->')
		eyes.inspect(this.options)
		// super(address, _.merge(options, _.merge(uWebSocket.defaults, options)))
		// console.info('this.options ->')
		// eyes.inspect(this.options)
		// ticks.EE3.addListener(this.options.heartrate, i => this.ping(i))
		// let socket = new WebSocket(address, { headers: { xid: 'randomxid' } })

	}

}

export default uWebSocket













// class Radio {

// 	private onopen = () => {
// 		console.info('onopen')
// 	}
// 	private onmessage = (event: any) => {
// 		console.log('onmessage ->', event)
// 	}
// 	private onreconnect = (event: any) => {
// 		console.log('onreconnect ->', event)
// 	}
// 	private onmaximum = (event: any) => {
// 		console.log('onmaximum ->', event)
// 	}
// 	private onclose = (code: number, message: string) => {
// 		console.warn('onclose ->', code, message)
// 	}
// 	private onerror = (error: Error) => {
// 		if (!error) return;
// 		console.error('onerror Error ->', error.message || error)
// 	}
// 	private socket = new Sockette(ADDRESS, {
// 		timeout: 1000, maxAttempts: Infinity,
// 		onopen: this.onopen, onclose: this.onclose,
// 		onmessage: this.onmessage, onerror: this.onerror,
// 		onreconnect: this.onreconnect, onmaximum: this.onmaximum,
// 	})

// 	private ee3 = new ee3.EventEmitter()

// 	constructor() {
// 		// console.log('this.socket ->', this.socket)
// 		// console.log('this.socket.$ ->', this.socket.$)
// 		// console.log('WebSocket ->', WebSocket)
// 	}

// }

// export default new Radio()







// class uWebSocket extends uws {

// 	private static get defaults() {
// 		return _.clone({
// 			timeout: 1000,
// 			reconnects: true,
// 			heartrate: ticks.T5,
// 			verbose: false,
// 		})
// 	}

// 	constructor(
// 		public address: string,
// 		private options = {} as Partial<typeof uWebSocket.defaults & uws.IClientOptions>,
// 	) {
// 		super(address, _.merge(options, _.merge(uWebSocket.defaults, options)))
// 		console.info('this.options ->')
// 		eyes.inspect(this.options)
// 		// ticks.EE3.addListener(ticks.T3, i => this.ping(i))
// 	}

// }







// class Radio {

// 	// private socket = new uWebSocket(ADDRESS)
// 	// private emitter = new ee3.EventEmitter()

// 	constructor() {
// 		// let socket = new uWebSocket(ADDRESS, { verbose: true, headers: {xid: 'badd'} })
// 		let opts = { host: 'nothere', origin: 'duhfudhfuhdf', headers: { 'sec-websocket-version': 'iswhuuuuuu' } } as WebSocket.IClientOptions
// 		console.info('opts ->')
// 		eyes.inspect(opts)
// 		let socket = new WebSocket(ADDRESS, opts)
// 	}

// }

// export default new Radio()







// type uWebSocketOptions = Partial<typeof uWebSocket.options>
// interface uWebSocket extends uWebSocketOptions { }
// class uWebSocket extends uws {

// 	static get options() {
// 		return _.clone({
// 			address: '',
// 			copts: {} as uws.IClientOptions,
// 			name: '',
// 			timeout: 1000,
// 			reconnects: true,
// 			verbose: false,
// 		})
// 	}

// 	constructor(
// 		uwsopts: { address: string, options?: uws.IClientOptions },
// 		options = {} as uWebSocketOptions,
// 	) {
// 		_.merge(options, _.merge(uWebSocket.options, options))
// 		super(address, options.uwsopts)
// 		_.merge(this, options)
// 		ticks.EE3.addListener(ticks.T3, i => this.ping(i))
// 	}

// }





// export default EE3


// const wsc = new Sockette(ADDRESS, {
// 	// timeout: 1000, // maxAttempts: Infinity,
// 	onopen: e => console.log('Connected!', e),
// 	onmessage: e => console.log('Received:', e),
// 	onreconnect: e => console.log('Reconnecting...', e),
// 	onmaximum: e => console.log('Stop Attempting!', e),
// 	onclose: e => console.log('Closed!', e),
// 	onerror: e => console.log('Error:', e)
// })





