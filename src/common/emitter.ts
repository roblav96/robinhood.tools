// 

export { Event, Listener } from 'eventemitter3'
import * as EventEmitter3 from 'eventemitter3'
import * as pEvent from 'p-event'



export default class Emitter<Names extends string = string, Data = any> extends EventEmitter3<Names, Data> {

	get events() { return this._events }

	hasListener(listener: EventEmitter3.Listener<Data>, context?: any, once?: boolean): boolean {
		let ee3s = this.events
		let names = Object.keys(ee3s)
		let i: number, len = names.length
		for (i = 0; i < len; i++) {
			let name = names[i]
			let events = ee3s[name] as EventEmitter3.Event<Data>[]
			if (!Array.isArray(events)) events = [events];
			let ii: number, lenn = events.length
			for (ii = 0; ii < lenn; ii++) {
				let event = events[ii]
				if (arguments.length == 1) {
					if (listener == event.fn) {
						return true
					}
				} else if (arguments.length == 2) {
					if (listener == event.fn && context == event.context) {
						return true
					}
				} else if (arguments.length == 3) {
					if (listener == event.fn && context == event.context && once == event.once) {
						return true
					}
				}
			}
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

	offAll<Name extends Names>(name?: Name): this {
		return this.removeAllListeners(name)
	}

	toPromise<Name extends Names>(name: Name): Promise<any> {
		return pEvent(this, name)
	}

	// hasListener(listener: EventEmitter3.Listener<Data>, context?: any, once?: boolean): boolean {
	// 	if (arguments.length == 1) {
	// 		let names = this.eventNames()
	// 		let i: number, len = names.length
	// 		for (i = 0; i < len; i++) {
	// 			let name = names[i]
	// 			let listeners = this.listeners(name)
	// 			if (listeners.includes(listener)) {
	// 				return true
	// 			}
	// 		}
	// 		return false
	// 	}
	// }

}


