// 

import * as _ from 'lodash'
import * as uws from 'uws'
import * as url from 'url'
import Emitter from './emitter'
import clock from './clock'



export default class WebSocketClient extends Emitter<'open' | 'close' | 'error' | 'message', string | number | Error> {

	private static readonly ecodes = {
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
			query: null as () => string,
			retry: true,
			timeout: '3s' as Clock.Tick,
			connect: true,
			delayed: -1,
			heartbeat: '10s' as Clock.Tick,
			verbose: false,
		})
	}

	get name() {
		let parsed = url.parse(this.address)
		if (parsed.pathname) return 'ws:/' + parsed.pathname;
		return 'ws:' + parsed.host
	}

	constructor(
		public address: string,
		public options = {} as Partial<typeof WebSocketClient.options>,
	) {
		super()
		_.defaults(this.options, WebSocketClient.options)
		if (!this.options.connect) return;
		if (this.options.delayed >= 0) _.delay(this._connect, this.options.delayed);
		else this.connect();
	}

	socket: WebSocket & uws

	get isopen() { return this.socket && this.socket.readyState == this.socket.OPEN }

	json<T = object>(data: T) { this.send(JSON.stringify(data)) }
	send(message: string) {
		this.socket.send(message)
	}

	close(code = 1000, reason?: string) {
		this.socket.close(code, reason)
	}

	destroy() {
		this.terminate()
		clock.offListener(this._connect)
		this.offAll()
	}

	terminate() {
		clock.offListener(this._connect)
		clock.offListener(this._heartbeat)
		if (!this.socket) return;
		this.socket.close()
		if (process.SERVER) {
			this.socket.terminate()
			this.socket.removeAllListeners()
		}
		this.socket = null
	}

	reconnect() {
		clock.offListener(this._connect)
		clock.once(this.options.timeout, this._connect)
	}

	private _connect = () => this.connect()
	connect() {
		this.terminate()
		let address = this.options.query ? this.address + '?' + this.options.query() : this.address
		this.socket = new WebSocket(address) as any
		this.socket.onopen = this._onopen as any
		this.socket.onclose = this._onclose as any
		this.socket.onerror = this._onerror as any
		this.socket.onmessage = this._onmessage as any
		this.reconnect()
	}

	private _onopen = (event: Event) => {
		if (this.options.verbose) console.info(this.name, 'onopen ->', process.CLIENT ? (event.target as WebSocket).url : '');
		clock.on(this.options.heartbeat, this._heartbeat)
		clock.offListener(this._connect)
		this.emit('open')
	}

	private _onclose = (event: CloseEvent) => {
		console.warn(this.name, 'onclose ->', WebSocketClient.ecodes[event.code] || event.code, '->', event.reason)
		this.emit('close', event.code, event.reason)
		clock.offListener(this._heartbeat)
		if (this.options.retry) this.reconnect();
		else this.destroy();
	}

	private _onerror = (error: Error) => {
		console.error(this.name, 'onerror Error ->', error.message || error)
		this.emit('error', error)
	}

	private _onmessage = (event: MessageEvent) => {
		let message = event.data as string
		if (message == 'pong') return;
		if (message == 'ping') return this.send('pong');
		if (this.options.verbose) console.log(this.name, 'onmessage ->', message);
		this.emit('message', message)
	}

	private _heartbeat = () => {
		if (!this.isopen) return clock.offListener(this._heartbeat);
		this.send('ping')
	}

}


