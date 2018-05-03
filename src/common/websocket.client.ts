// 

import { WS } from './socket'
import * as _ from './lodash'
import * as qs from 'querystring'
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
			query: null as () => object,
			timeout: '3s' as Clock.Tick,
			heartbeat: '10s' as Clock.Tick,
			connect: true,
			retry: true,
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

	ws: WebSocket & uws
	alive() { return this.ws && this.ws.readyState == this.ws.OPEN }

	send(message: string) {
		if (!this.alive()) return;
		this.ws.send(message)
	}
	json(data: any) {
		if (!this.alive()) return;
		this.ws.send(JSON.stringify(data))
	}
	binary(data: any) {
		if (!this.alive()) return;
		this.ws.send(Buffer.from(data), { binary: true })
	}

	close(code = 1000, reason = '') {
		if (!this.alive()) return;
		this.ws.close(code, reason)
	}

	destroy() {
		this.terminate()
		this.offAll()
	}

	terminate() {
		clock.offListener(this._connect)
		clock.offListener(this._heartbeat)
		if (!this.ws) return;
		this.ws.close()
		if (process.env.SERVER) {
			this.ws.terminate()
			this.ws.removeAllListeners()
		}
		this.ws = null
	}

	private _reconnect() {
		clock.offListener(this._connect)
		clock.once(this.options.timeout, this._connect)
	}

	private _connect = () => this.connect()
	connect() {
		this.terminate()
		let address = this.options.query ? `${this.address}?${qs.stringify(this.options.query())}` : this.address
		this.ws = new WebSocket(address) as any
		this.ws.binaryType = 'arraybuffer'
		this.ws.onopen = this._onopen as any
		this.ws.onclose = this._onclose as any
		this.ws.onerror = this._onerror as any
		this.ws.onmessage = this._onmessage as any
		this._reconnect()
	}

	private _onopen = (event: Event) => {
		if (this.options.verbose) console.info(this.name, 'onopen');
		if (this.options.heartbeat) clock.on(this.options.heartbeat, this._heartbeat);
		clock.offListener(this._connect)
		this.emit('open', event)
	}

	private _onclose = (event: CloseEvent) => {
		let code = WebSocketClient.CODES[event.code] || event.code
		if (this.options.verbose) console.warn(this.name, 'onclose ->', code, '->', event.reason);
		this.emit('close', _.pick(event, ['code', 'reason']))
		if (this.options.retry) return this._reconnect();
		this.destroy()
	}

	private _onerror = (error: Error) => {
		let message = (error.message || error) as string
		if (this.options.verbose) console.error(this.name, 'onerror Error ->', message);
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
		if (this.alive()) return this.send('ping');
		clock.offListener(this._heartbeat)
	}

}


