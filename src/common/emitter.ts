// 

export { Event, Listener } from 'eventemitter3'
import * as EventEmitter3 from 'eventemitter3'
import * as pEvent from 'p-event'



export default class Emitter<Names extends string = string, Data = any> extends EventEmitter3<Names, Data> {

	events() { return this._events }

	hasListener(listener: EventEmitter3.Listener<Data>): boolean {
		let names = this.eventNames()
		let i: number, len = names.length
		for (i = 0; i < len; i++) {
			let name = names[i]
			let listeners = this.listeners(name)
			if (listeners.includes(listener)) return true;
		}
		return false
	}

	offListener(listener: EventEmitter3.Listener<Data>, context?: any, once?: boolean): this {
		this.eventNames().forEach(name => {
			this.listeners(name).forEach(fn => {
				this.off(name, listener, context, once)
			})
		})
		return this
	}

	offAll<Name extends Names>(name?: Name) {
		return this.removeAllListeners(name)
	}

	toPromise<Name extends Names>(name: Name) {
		return pEvent(this, name)
	}

}


