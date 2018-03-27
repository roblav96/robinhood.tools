// 

import * as _ from 'lodash'
import * as ee4 from './ee4'

import * as uws from 'uws'
import * as url from 'url'
import ticks from './ticks'



export default class uWebSocket extends ee4.EventEmitter<'open' | 'close' | 'error' | 'message' | 'ping' | 'pong'> {

	private static get defaults() {
		return _.clone({
			autoreconnect: true,
			retrytimeout: DEVELOPMENT ? 5000 : 1000,
			startdelay: -1,
			heartrate: ticks.T10,
			verbose: false,
		})
	}

	get name() { return 'ws:/' + url.parse(this.address).path }

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
	get OPEN() { return this._socket.OPEN }
	get CLOSED() { return this._socket.CLOSED }

	json(data: object) { this.send(JSON.stringify(data)) }
	send(message: string) { this._socket.send(message, this._sent) }
	private _sent = (error?: Error) => {
		if (error) console.error(this.name, 'onerror Error ->', error.message || error);
	}

	ping(message?: string) {
		this._socket.ping(message)
	}

	close(code?: number, reason?: string) {
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
		this._socket.terminate()
		this._socket.removeAllListeners()
		this._socket = null
	}

	reconnect: (() => void) & _.Cancelable
	connect() {
		this.terminate()
		this._socket = new WebSocket(this.address) as any
		if (process.SERVER) {
			this._socket.on('open', this._onopen)
			this._socket.on('close', this._onclose)
			this._socket.on('error', this._onerror)
			this._socket.on('message', this._onmessage)
			this._socket.on('ping', this._onping)
			this._socket.on('pong', this._onpong)
		}
		if (process.CLIENT) {
			this._socket.addEventListener('open', this._onopen)
			this._socket.addEventListener('close', this._onclose)
			this._socket.addEventListener('error', this._onerror)
			this._socket.addEventListener('message', this._onmessage)
			this._socket.addEventListener('ping', this._onping)
			this._socket.addEventListener('pong', this._onpong)
		}
		// this._socket.onopen = this._onopen
		// this._socket.onclose = this._onclose
		// this._socket.onerror = this._onerror
		// this._socket.onmessage = this._onmessage
		// this._socket.onping = this._onping
		// this._socket.onpong = this._onpong
		this.reconnect()
	}

	private _onopen = (event) => {
		if (this.options.verbose) console.info(this.name, 'onopen ->', event);
		ticks.EE4.addListener(this.options.heartrate, this._heartbeat)
		this.reconnect.cancel()
		this.emit('open')
	}

	private _onclose = (code?: number, reason?: string) => {
		if (this.options.verbose) console.warn(this.name, 'onclose ->', code, reason);
		this.emit('close', code, reason)
		if (!this.options.autoreconnect) {
			return this.destroy()
		}
		this.reconnect()
	}

	private _onerror = (error: Error) => {
		if (this.options.verbose) console.error(this.name, 'onerror Error ->', error.message || error);
		this.emit('error', error)
	}

	private _onmessage = (message: string) => {
		if (this.options.verbose) console.log(this.name, 'onmessage ->', message);
		this.emit('message', message)
	}

	private _onping = (message: string) => {
		if (this.options.verbose) console.log(this.name, 'onping ->', message);
		this.emit('ping', message)
	}
	private _onpong = (message: string) => {
		if (this.options.verbose) console.log(this.name, 'onpong ->', message);
		this.emit('pong', message)
	}

	private _heartbeat = () => {
		if (this._socket) this._socket.ping();
		else ticks.EE4.removeListenerFunction(this._heartbeat);
	}

}



// type uWebSocketOptions = typeof uWebSocket.options
// interface uWebSocket extends uWebSocketOptions { }
// class uWebSocket extends WebSocket {




