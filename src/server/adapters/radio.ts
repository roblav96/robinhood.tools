// 

import * as Sockette from 'sockette'
import * as uws from 'uws'
import * as fastjsonparse from 'fast-json-parse'
import * as security from './security'
import clock from '../../common/clock'
import Emitter from '../../common/emitter'



class Radio extends Emitter {

	private sockette: Sockette
	private uuid = security.randomBits(16)
	private name = process.env.NAME
	private instance = +process.env.INSTANCE
	private get host() {
		return { name: process.env.NAME, uuid: this.uuid, instance: +process.env.INSTANCE } as Radio.Host
	}

	constructor() {
		super()
		// clock.on('1s', this.sync, this)
		this.sockette = new Sockette(`ws://localhost:${+process.env.PORT - 1}/radio`, {
			timeout: 1000,
			maxAttempts: Infinity,
			onopen: this.onopen,
			onclose: this.onclose,
			onerror: this.onerror,
			onmessage: this.onmessage,
		})
		console.log(`this.sockette ->`, this.sockette)
	}

	alive = false
	private onopen = () => {
		console.info(`onopen ->`)
		this.alive = true
		this.emit('open')
		this.sockette.send('__onopen__')
	}
	private onclose = (event: CloseEvent) => {
		console.warn('onclose ->', event)
		this.alive = false
		this.emit('close', event)
		clock.once('1s', this.sockette.open, this)
	}
	private onerror = (event: ErrorEvent) => {
		if (event.message.indexOf('uWs') != 0) {
			console.error(`onerror Error -> %O`, event)
		}
		this.alive = false
		this.emit('error', event)
		clock.once('1s', this.sockette.open, this)
	}
	private onmessage = ({ data }: MessageEvent) => {
		let message = data as string
		if (message == 'pong') return;
		if (message == 'ping') return this.sockette.send('pong');
		if (message == '__onready__') {
			this.ready = true
			this.emit('ready')
			return
		}
		let parsed = fastjsonparse(message)
		if (parsed.err) return console.error(`parsed.err.message Error -> %O`, parsed.err.message);
		let event = parsed.value as Radio.Event
		if (event.selector) {
			if (event.selector.uuid && event.selector.uuid != this.uuid) return;
			if (event.selector.name && event.selector.name != process.env.NAME) return;
			if (event.selector.instance && event.selector.instance != +process.env.INSTANCE) return;
		}
		this.emit(event.name, event.data)
	}

	ready = false
	pready() {
		if (this.alive) return Promise.resolve();
		return this.toPromise('ready')
	}

	send(event: Partial<Radio.Event>) {
		event.host = this.host
		let message = JSON.stringify(event)
		this.sockette.send(message)
	}

}

const radio = new Radio()
export default radio



declare global {
	namespace Radio {
		interface Event<Data = any> {
			name: string
			data: Data
			// action: string
			// subs: string[]
			host: Host
			selector: Partial<Host>
		}
		interface Host {
			name: string
			uuid: string
			instance: number
		}
	}
}


