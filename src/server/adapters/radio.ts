// 

import * as Sockette from 'sockette'
import * as uws from 'uws'
import * as fastjsonparse from 'fast-json-parse'
import * as security from './security'
import * as _ from '../../common/lodash'
import * as Rx from '../../common/rxjs'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'



class Radio extends Emitter<string, Radio.Event> {

	private sockette: Sockette
	private uuid = security.randomBits(16)
	private name = process.env.NAME
	private instance = +process.env.INSTANCE
	private get host() {
		return { uuid: this.uuid, name: this.name, instance: this.instance } as Radio.Host
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

	private reconnect = _.debounce(() => this.sockette.open(), 100, { leading: false, trailing: true })
	private onopen = () => {
		this.sockette.send('__onopen__')
	}
	private onclose = (event: CloseEvent) => {
		console.warn('onclose ->', event)
		this.isopen = false
		this.reconnect()
	}
	private onerror = (event: ErrorEvent) => {
		if (event.message.indexOf('uWs') != 0) {
			console.error(`onerror Error -> %O`, event)
		}
		this.isopen = false
		this.reconnect()
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
		super.emit(event.name, event)
	}

	event(event: Partial<Radio.Event>) {
		event.host = this.host
		let message = JSON.stringify(event)
		if (this.isready) return this.sockette.send(message);
		this.toPromise('ready').then(() => this.sockette.send(message))
	}
	emit(name: string, data?: any) {
		this.event({ name, data })
	}
	send(selector: Partial<Radio.Host>, name: string, data?: any) {
		this.event({ selector, name, data })
	}

	reply(name: string, fn: (request: any) => Promise<any>) {
		this.on(name, (event: Radio.Event<Radio.InvokeReply>) => {
			let reqid = event.data.reqid
			let uuid = event.host.uuid
			return fn(event.data.request).then(response => {
				this.send({ uuid }, name, { reqid, response } as Radio.InvokeReply)
			}).catch(error => {
				this.send({ uuid }, name, { reqid, error } as Radio.InvokeReply)
			})
		})
	}
	invoke(selector: Partial<Radio.Host>, name: string, request?: any) {
		let uuid = this.uuid
		let reqid = security.randomBits(16)
		return new Promise<any>((resolve, reject) => {
			this.on(name, function onreply(event: Radio.Event<Radio.InvokeReply>) {
				if (event.host.uuid == uuid) return;
				if (event.data.reqid != reqid) return;
				radio.off(name, onreply)
				event.data.error ? reject(event.data.error) : resolve(event.data.response)
			})
			this.send(selector, name, { reqid, request } as Radio.InvokeReply)
		})
	}

}

const radio = new Radio()
export default radio



declare global {
	namespace Radio {
		interface Event<T = any> {
			name: string
			data: T
			host: Host
			selector: Partial<Host>
		}
		interface Host {
			uuid: string
			name: string
			instance: number
		}
		interface InvokeReply {
			request: any
			response: any
			reqid: string
			error: Error
		}
	}
}


