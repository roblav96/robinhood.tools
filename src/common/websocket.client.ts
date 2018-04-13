// 

import * as _ from './lodash'
import * as uws from 'uws'
import * as url from 'url'
import * as core from './core'
import Emitter from './emitter'
import clock from './clock'



export default class WebSocketClient extends Emitter<'open' | 'close' | 'error' | 'message'> { //, string | number | Error> {

	static readonly CODES = {
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
			timeout: '3s' as Clock.Tick,
			heartbeat: '10s' as Clock.Tick,
			connect: true,
			retry: true,
			silent: false,
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
		if (this.options.connect) this.connect();
	}

	socket: WebSocket & uws
	isopen() { return this.socket && this.socket.readyState == this.socket.OPEN }

	json<T = object>(data: T) { this.send(JSON.stringify(data)) }
	send(message: string) {
		if (!this.isopen()) {
			if (!this.options.silent) console.error(this.name, 'send Error ->', 'Socket is not open');
			return
		}
		this.socket.send(message)
	}

	close(code = 1000, reason?: string) {
		// if (!this.isopen()) return;
		if (!this.isopen()) {
			if (!this.options.silent) console.error(this.name, 'close Error ->', 'Socket is already closed');
			return
		}
		this.socket.close(code, reason)
	}

	destroy() {
		this.terminate()
		this.offAll()
	}

	terminate() {
		clock.offListener(this._connect)
		clock.offListener(this._heartbeat)
		if (!this.socket) return;
		this.socket.close(1000)
		if (process.SERVER) {
			this.socket.terminate()
			this.socket.removeAllListeners()
		}
		this.socket = null
	}

	private _reconnect() {
		clock.offListener(this._connect)
		clock.once(this.options.timeout, this._connect)
	}

	private _connect = () => this.connect()
	connect() {
		this.terminate()
		let address = this.options.query ? `${this.address}?${this.options.query()}` : this.address
		this.socket = new WebSocket(address) as any
		this.socket.onopen = this._onopen as any
		this.socket.onclose = this._onclose as any
		this.socket.onerror = this._onerror as any
		this.socket.onmessage = this._onmessage as any
		this._reconnect()
	}

	private _onopen = (event: Event) => {
		if (!this.options.silent && this.options.verbose) console.info(this.name, 'onopen'); // ->', process.CLIENT ? (event.target as WebSocket).url : '');
		clock.on(this.options.heartbeat, this._heartbeat)
		clock.offListener(this._connect)
		this.emit('open', event)
	}

	private _onclose = (event: CloseEvent) => {
		let code = WebSocketClient.CODES[event.code] || event.code
		if (!this.options.silent && this.options.verbose) console.warn(this.name, 'onclose ->', code, '->', event.reason);
		this.emit('close', _.pick(event, ['code', 'reason']))
		clock.offListener(this._heartbeat)
		if (this.options.retry) this._reconnect();
		else this.destroy();
	}

	private _onerror = (error: Error) => {
		if (!this.options.silent) {
			let message = (error.message || error) as string
			if (message != 'uWs client connection error') {
				console.error(this.name, 'onerror Error ->', message)
			}
		}
		this.emit('error', error)
	}

	private _onmessage = (event: MessageEvent) => {
		let message = event.data as string
		if (message == 'pong') return;
		if (message == 'ping') return this.send('pong');
		if (!this.options.silent && this.options.verbose) console.log(this.name, 'onmessage ->', message);
		this.emit('message', message)
	}

	private _heartbeat = () => {
		if (this.isopen()) this.send('ping');
		else clock.offListener(this._heartbeat);
	}

}


