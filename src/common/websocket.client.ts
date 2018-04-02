// 

import * as _ from 'lodash'
import * as uws from 'uws'
import * as url from 'url'
import Emitter from './emitter'
import ticks from './ticks'



export default class WebSocketClient extends Emitter<'open' | 'close' | 'error' | 'message'> {

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
			query: undefined as () => string,
			autoretry: true,
			retrytimeout: 3000,
			autoconnect: true,
			delaystart: -1,
			heartrate: ticks.t10s,
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
		this.reconnect = _.throttle(this.connect, this.options.retrytimeout, { leading: false, trailing: true })
		if (!this.options.autoconnect) return;
		if (this.options.delaystart >= 0) _.delay(() => this.connect(), this.options.delaystart);
		else this.connect();
	}

	socket: WebSocket & uws
	get isopen() { return this.socket && this.socket.readyState == this.socket.OPEN }

	json<T = object>(data: T) { this.send(JSON.stringify(data)) }
	send(message: string) {
		if (process.CLIENT) this.socket.send(message);
		if (process.SERVER) this.socket.send(message, this._sent);
	}
	private _sent = (error?: Error) => { if (error) console.error(this.name, '_sent Error ->', error); }

	close(code = 1000, reason?: string) {
		this.socket.close(code, reason)
	}

	destroy() {
		this.terminate()
		this.reconnect.cancel()
		this.reconnect = null
		this.removeAllListeners()
	}

	terminate() {
		this.reconnect.cancel()
		ticks.removeHandler(this._heartbeat)
		if (!this.socket) return;
		this.socket.close()
		if (process.SERVER) {
			this.socket.terminate()
			this.socket.removeAllListeners()
		}
		this.socket = null
	}

	reconnect: (() => void) & _.Cancelable
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
		ticks.addListener(this.options.heartrate, this._heartbeat)
		this.reconnect.cancel()
		this.emit('open')
	}

	private _onclose = (event: CloseEvent) => {
		console.warn(this.name, 'onclose ->', WebSocketClient.ecodes[event.code] || event.code, '->', event.reason)
		this.emit('close', event.code, event.reason)
		ticks.removeHandler(this._heartbeat)
		if (this.options.autoretry) this.reconnect();
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
		if (!this.isopen) return ticks.removeHandler(this._heartbeat);
		this.send('ping')
	}

}


