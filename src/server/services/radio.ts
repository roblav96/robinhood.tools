// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as ee3 from '../../common/ee3'

import * as WebSocket from 'uws'
import uWebSocket from '../adapters/uwebsocket'



const PATH = 'radio'
const PORT = process.PORT - 1

if (process.MASTER) {

	const wss = new WebSocket.Server({
		path: PATH, port: PORT,
		verifyClient(incoming, next) {
			next(incoming.req.headers['host'] == 'localhost')
		},
	})

	const onmessage = function(this: WebSocket, message: string) {
		if (message == '_onopen_') {
			if (wss.clients.length > process.INSTANCES) {
				wss.broadcast(JSON.stringify({ event: '_onready_', clients: wss.clients.length }))
			}
			return
		}
		wss.broadcast(message)
	}

	wss.on('connection', function(client) {
		client.on('message', onmessage)
		// _.delay(function() { client.close() }, 3000)
	})

	wss.on('error', function(error) {
		console.error('uws Server Error ->', error)
	})

}



const ADDRESS = 'ws://localhost:' + PORT + '/' + PATH

// export default new class Radio extends ee3.EventEmitter<'_onopen_' | '_onready_'> {
export default new class Radio extends ee3.EventEmitter {

	private _socket = new uWebSocket(ADDRESS, { verbose: true, retrytimeout: 1000 })

	constructor() {
		super()
		this._socket.once('open', () => {
			super.emit('_onopen_')
			this._socket.send('_onopen_')
		})
		this._socket.on('message', (message: Radio.Message) => {
			message = JSON.parse(message as any)
			if (message.event == '_onready_') {
				if (message.clients > process.INSTANCES) {
					super.emit('_onready_')
				}
				return
			}
			// if ((message as any) == '_onready_') {
			// 	super.emit('_onready_')
			// 	return
			// }
			super.emit(message.event, message.data)
		})
	}

	emit(event: string, data?: any) {
		return !!this._socket.json({ event, data } as Radio.Message)
	}

}





declare global {
	namespace Radio {
		interface Message<T = any> {
			event: string
			data?: T
			clients?: number
		}
	}
}







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





