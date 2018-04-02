// 

import * as _ from 'lodash'
import * as ee3 from 'eventemitter3'



type AnyHandler = any
type Handler = (...args: any[]) => void
interface Event { handler: Handler, context?: any, once?: boolean }
interface Emitter<E = string> {
	eventNames(): E[]
	listeners(event: E): Handler[]
	listenerCount(event: E): number
	emit(event: E, ...args: any[]): boolean
	on(event: E, handler: Handler, context?: any): this
	addListener(event: E, handler: Handler, context?: any): this
	once(event: E, handler: Handler, context?: any): this
	removeListener(event: E, handler?: Handler, context?: any, once?: boolean): this
	off(event: E, handler?: Handler, context?: any, once?: boolean): this
	removeAllListeners(event?: E): this
	// 
	removeListener(handler: Handler, context?: any, once?: boolean): this
	// off(handler: Handler, context?: any, once?: boolean): this
	// removeAllListeners(handler: Handler): this
}

// class Emitter<E = string> extends ((ee3.EventEmitter as any) as _Emitter) {
// class Emitter<E = string> extends ((ee3 as any).EventEmitter as typeof ee3.EventEmitter) {
// class Emitter<E = string> extends (ee3.EventEmitter as any) {
class Emitter<E = string> extends ee3.EventEmitter<E> {

	protected _events: Dict<Event>

	findHandlerEvent(handler: AnyHandler) {
		let names = this.eventNames()
		let i: number, len = names.length
		for (i = 0; i < len; i++) {
			let name = names[i]
			let listeners = this.listeners(name)
			let ii: number, len = listeners.length
			for (ii = 0; ii < len; ii++) {
				if (handler === listeners[ii]) {
					return name
				}
			}
		}
	}

	removeHandler(handler: Handler, context?: any, once?: boolean) {
		if (_.isFunction(handler)) {
			console.warn('removeListener handler ->', handler)
			let name = this.findHandlerEvent(handler)
			if (name) return super.removeListener(name, handler, context, once);
		}
		return super.removeListener.apply(this, arguments)
		// return super.removeListener(...arguments)
	}
	
	offHandler(handler: Handler, context?: any, once?: boolean) {
		
	}

	// if (!_.isFunction(handler)) return super.removeListener.apply(this, arguments);
	// let names = Object.keys(this._events)
	// let i: number, len = names.length
	// for (i = 0; i < len; i++) {
	// 	let name = names[i]
	// 	let event = this._events[name]
	// 	if (handler == event.handler) {
	// 		return super.removeListener(name as any, handler, context, once)
	// 	}
	// }
	// this.eventNames().forEach(event => {
	// 	this.listeners(event).forEach(listener => {
	// 		if (handler === listener) {
	// 			super.removeListener(event, handler, context, once)
	// 		}
	// 	})
	// })
	// return this
	// }
	// off(handler, context?: any, once?: boolean) {
	// 	if (typeof handler == 'string') return super.removeListener.apply(this, arguments);
	// }
	// offFunction(fn: (...args: D[]) => void, context?: any, once?: boolean) { return this.removeListenerFunction(fn, context, once) }

}

export default Emitter


