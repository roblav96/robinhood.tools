// 

import * as Sockette from 'sockette'
import * as uws from 'uws'
import * as fastjsonparse from 'fast-json-parse'
import * as security from './security'
import * as Rx from '../../common/rxjs'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'



class Radio extends Emitter {

	private sockette: Sockette
	private uuid = security.randomBits(16)
	private name = process.env.NAME
	private instance = +process.env.INSTANCE
	private get host() {
		return { name: this.name, uuid: this.uuid, instance: this.instance } as Radio.Host
	}

	constructor() {
		super()
		this.sockette = new Sockette(`ws://localhost:${+process.env.PORT - 1}/radio`, {
			timeout: 1000,
			maxAttempts: Infinity,
			onopen: this.onopen,
			onclose: this.onclose,
			onerror: this.onerror,
			onmessage: this.onmessage
		})
	}

	isopen = false
	isready = false

	private onopen = () => {
		this.sockette.send('__onopen__')
	}
	private onclose = (event: CloseEvent) => {
		console.warn('onclose ->', event)
		this.isopen = false
		super.emit('close', event)
		this.sockette.open()
	}
	private onerror = (event: ErrorEvent) => {
		if (event.message.indexOf('uWs') != 0) {
			console.error(`onerror Error -> %O`, event)
		}
		this.isopen = false
		super.emit('error', event)
		this.sockette.open()
	}
	private onmessage = ({ data }: MessageEvent) => {
		let message = data as string
		if (message == 'pong') return;
		if (message == 'ping') return this.sockette.send('pong');
		if (message == '__onopen__') {
			this.isopen = true
			super.emit('open')
			return
		}
		if (message == '__onready__') {
			this.isready = true
			super.emit('ready')
			return
		}
		let parsed = fastjsonparse(message)
		if (parsed.err) return console.error(`parsed.err.message Error -> %O`, parsed.err.message);
		let event = parsed.value as Radio.Event
		if (event.selector) {
			if (event.selector.uuid && event.selector.uuid != this.uuid) return;
			if (event.selector.name && event.selector.name != this.name) return;
			if (Number.isFinite(event.selector.instance) && event.selector.instance != this.instance) return;
		}
		super.emit(event.name, ...event.args)
	}

	event(event: Partial<Radio.Event>) {
		event.host = this.host
		let message = JSON.stringify(event)
		if (this.isopen && this.isready) return this.sockette.send(message);
		this.toPromise('ready').then(() => this.sockette.send(message))
	}
	emit(name: string, ...args: any[]) {
		this.event({ name, args })
	}
	send(selector: Radio.Host, name: string, ...args: any[]) {
		this.event({ selector, name, args })
	}

}

const radio = new Radio()
export default radio



declare global {
	namespace Radio {
		interface Event {
			name: string
			args: any[]
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


