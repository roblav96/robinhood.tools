// 

import * as _ from 'lodash'
import * as ee4 from './ee4'

import * as uws from 'uws'
import * as url from 'url'
import ticks from './ticks'



export default class uWebSocket extends ee4.EventEmitter<'open' | 'close' | 'error' | 'message'> {

	private static readonly codes = {
		1000: 'CLOSE_NORMAL',
		1001: 'CLOSE_GOING_AWAY',
		1002: 'CLOSE_PROTOCOL_ERROR',
		1003: 'CLOSE_UNSUPPORTED',
		1005: 'CLOSED_NO_STATUS',
		1006: 'CLOSE_ABNORMAL',
	}

	private static get defaults() {
		return _.clone({
			query: undefined as () => string,
			autoreconnect: true,
			retrytimeout: DEVELOPMENT ? 3000 : 1000,
			startdelay: -1,
			heartrate: ticks.T10,
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
		public options = {} as Partial<typeof uWebSocket.defaults>,
	) {
		super()
		_.defaults(this.options, uWebSocket.defaults)
		this.reconnect = _.throttle(this.connect, this.options.retrytimeout, { leading: false, trailing: true })
		this.options.startdelay == -1 ? this.connect() : _.delay(() => this.connect(), this.options.startdelay)
	}

	private _socket: WebSocket & uws
	get isopen() { return this._socket && this._socket.readyState == this._socket.OPEN }

	json(data: object) { this.send(JSON.stringify(data)) }
	send(message: string) {
		if (process.CLIENT) this._socket.send(message);
		if (process.SERVER) this._socket.send(message, this._sent);
	}
	private _sent = (error?: Error) => {
		if (error) console.error(this.name, '_sent Error ->', error);
	}

	close(code = 1000, reason?: string) {
		this._socket.close(code, reason)
	}

	destroy() {
		this.terminate()
		this.reconnect.cancel()
		this.reconnect = null
		this.removeAllListeners()
	}

	terminate() {
		this.reconnect.cancel()
		ticks.EE4.removeListenerFunction(this._heartbeat)
		if (!this._socket) return;
		this._socket.close()
		if (process.SERVER) {
			this._socket.terminate()
			this._socket.removeAllListeners()
		}
		this._socket = null
	}

	reconnect: (() => void) & _.Cancelable
	connect() {
		this.terminate()
		let address = this.options.query ? this.address + '?' + this.options.query() : this.address
		this._socket = new WebSocket(address) as any
		this._socket.onopen = this._onopen as any
		this._socket.onclose = this._onclose as any
		this._socket.onerror = this._onerror as any
		this._socket.onmessage = this._onmessage as any
		this.reconnect()
	}
	private _reboot() {
		ticks.EE4.removeListenerFunction(this._heartbeat)
		if (this.options.autoreconnect) this.reconnect();
		else this.destroy();
	}

	private _onopen = (event: Event) => {
		if (this.options.verbose) console.info(this.name, 'onopen ->', process.CLIENT ? (event.target as WebSocket).url : '');
		ticks.EE4.addListener(this.options.heartrate, this._heartbeat)
		this.reconnect.cancel()
		this.emit('open')
	}

	private _onclose = (event: CloseEvent) => {
		console.warn(this.name, 'onclose ->', uWebSocket.codes[event.code] || event.code, '->', event.reason)
		this.emit('close', event.code, event.reason)
		this._reboot()
	}

	private _onerror = (error: Error) => {
		console.error(this.name, 'onerror Error ->', error.message || error)
		this.emit('error', error)
		// this._reboot()
	}

	private _onmessage = (event: MessageEvent) => {
		let message = event.data as string
		if (message == 'pong') return;
		if (message == 'ping') return this.send('pong');
		if (this.options.verbose) console.log(this.name, 'onmessage ->', message);
		this.emit('message', message)
	}

	private _heartbeat = () => {
		if (this.isopen) this.send('ping');
		else ticks.EE4.removeListenerFunction(this._heartbeat);
	}

}







// type uWebSocketOptions = typeof uWebSocket.options
// interface uWebSocket extends uWebSocketOptions { }
// class uWebSocket extends WebSocket {


