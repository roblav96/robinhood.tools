// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as ee3 from '../../common/ee3'

import * as uws from 'uws'
import * as url from 'url'
import ticks from '../services/ticks'



// private ews = new EWebSocket(ADDRESS, { debug: false })

export default class EWebSocket extends ee3.EventEmitter<keyof typeof EWebSocket> {

	private static toName(address: string) {
		let parsed = url.parse(address)
		return parsed.hostname + parsed.path
	}

	static readonly open = 'open'
	static readonly close = 'close'
	static readonly error = 'error'
	static readonly message = 'message'
	static readonly ping = 'ping'
	static readonly pong = 'pong'

	private _socket: uws
	get connecting() { return this._socket && this._socket.readyState == this._socket.CONNECTING }
	get open() { return this._socket && this._socket.readyState == this._socket.OPEN }
	get closing() { return this._socket && this._socket.readyState == this._socket.CLOSING }
	get closed() { return this._socket && this._socket.readyState == this._socket.CLOSED }

	name = EWebSocket.toName(this.address)
	autostart = true
	autoreconnect = true
	autodelay = 1000
	startdelay = 1
	heartrate = ticks.T10
	debug = false
	purged = false
	socketopts = {} as uws.IClientOptions

	constructor(
		private address: string,
		private opts = {} as Partial<EWebSocket>,
	) {
		super()
		core.object.assign(this, opts, true)
		this.reconnect = _.throttle(this.connect, this.autodelay, { leading: false, trailing: true })
		ticks.EE3.addListener(this.heartrate, this.heartbeat)
		if (this.autostart) _.delay(() => this.connect(), this.startdelay);
	}

	purge() {
		if (this.debug) console.error(this.name, 'purge Error -> purging!');
		this.destroy()
		this.reconnect.cancel()
		this.removeAllListeners()
		ticks.EE3.removeListener(this.heartrate)
		this.purged = true
	}

	destroy() {
		if (!this._socket) return console.error(this.name, 'destroy Error -> this._socket not truthy!');
		this._socket.close()
		this._socket.terminate()
		this._socket.removeAllListeners()
		this._socket = null
	}

	private reboot() {
		if (this.debug) console.info(this.name, 'reboot ->', 'autoreconnect', this.autoreconnect);
		this.destroy()
		this.reconnect.cancel()
		if (this.autoreconnect) this.reconnect();
		else this.purge();
	}

	reconnect: _.Cancelable & Function
	connect() {
		if (this.purged) return console.error(this.name, 'connect Error -> purged!');
		if (this.connecting) return console.warn(this.name, 'connect -> connecting');
		if (this.open) return console.warn(this.name, 'connect -> open');
		if (this._socket) {
			console.error(this.name, 'connect Error -> this._socket truthy!')
			this.destroy()
		}
		this.reconnect.cancel()
		this.reconnect()
		this._socket = new uws(this.address, this.socketopts)
		this._socket.on('open', this.onopen)
		this._socket.on('close', this.onclose)
		this._socket.on('error', this.onerror)
		this._socket.on('message', this.onmessage)
		if (this.debug) {
			this._socket.on('ping', this.onping)
			this._socket.on('pong', this.onpong)
		}
	}

	private heartbeat = () => {
		if (this.open) this._socket.ping();
	}
	private onping = data => { console.log(this.name, 'ping ->', data) }
	private onpong = data => { console.log(this.name, 'pong ->', data) }

	private onopen = () => {
		if (this.debug) console.info(this.name, 'onopen');
		this.reconnect.cancel()
		this.emit('open')
	}

	private onclose = (code: number, message: string) => {
		console.warn(this.name, 'onclose ->', code, message);
		this.emit('close', code, message)
		this.reboot()
	}

	private onerror = (error: Error) => {
		if (!error) return;
		console.error(this.name, 'onerror Error ->', error.message || error)
		this.emit('error', error)
		this.reboot()
	}

	private onmessage = (message: any) => {
		this.emit('message', message)
	}

}





