// 

import * as TinyEmitter from 'tiny-emitter'



export default class Emitter<E = string, D = any> extends TinyEmitter<string, any> {

	eventNames() {
		return Object.keys(this.e)
	}
	listeners(event?: E) {
		if (event) return this.e[event as any].map(v => v.fn);
		
		// if (!event) return this.eventNames().map(event => this.e[event].fn)
	}
	listenerCount(event?: E): number {
		return this.e[event as any].length
	}

	removeAllListeners(event?: E) {

	}

}





// import * as ee3 from 'eventemitter3'
// export default class Emitter<E = string, D = any> extends ee3.EventEmitter<E, D> {

// 	listenerEvents(handler: ee3.Listener<D>, context?: any, once?: boolean) {
// 		let events = [] as E[]
// 		this.eventNames().forEach(event => {
// 			this.listeners(event).forEach(fn => {
// 				if (handler == fn) events.push(event);
// 			})
// 		})
// 		return events
// 	}

// 	removeListeners(handler: ee3.Listener<D>, context?: any, once?: boolean) {
// 		this.handlerEvents(handler).forEach(event => {
// 			this.removeListener(event, handler, context, once)
// 		})
// 		return this
// 	}

// }


