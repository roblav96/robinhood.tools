// 

import * as _ from 'lodash'
import * as ee3 from 'eventemitter3'
import * as TinyEmitter from 'tiny-emitter'



export default class Emitter<E = string, D = any> extends ee3.EventEmitter<E, D> {

	handlerEvents(handler: ee3.Listener<D>, context?: any, once?: boolean) {
		let events = [] as ee3.Event<D>[]
		this.eventNames().forEach(name => {
			this.listeners(name).forEach(listener => {
				if (handler == listener) {
					events.push({ name: name as any, listener })
				}
			})
		})
		return events
	}

	removeHandler(handler: ee3.Listener<D>, context?: any, once?: boolean) {
		this.handlerEvents(handler).forEach(event => {
			this.removeListener(event.name as any, event.listener, context, once)
		})
		return this
	}
	offHandler(handler: ee3.Listener<D>, context?: any, once?: boolean) {
		return this.removeHandler(handler, context, once)
	}

	// handlerEventName(handler: ee3.Handler, context?: any, once?: boolean) {
	// 	let names = this.eventNames()
	// 	let i: number, len = names.length
	// 	for (i = 0; i < len; i++) {
	// 		let name = names[i]
	// 		let listeners = this.listeners(name)
	// 		let ii: number, len = listeners.length
	// 		for (ii = 0; ii < len; ii++) {
	// 			if (handler === listeners[ii]) {
	// 				return name
	// 			}
	// 		}
	// 	}
	// let name = this.handlerEvents(handler, context, once)
	// if (name) return super.removeListener(name, handler, context, once);
	// return super.removeListener(...arguments)
	// }

}


