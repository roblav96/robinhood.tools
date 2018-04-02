// 

import * as TinyEmitter from 'tiny-emitter'



interface Dict<T = any> { [name: string]: T }
interface TinyEvent { fn: (...args: any[]) => void, ctx: any }

interface Emitter<Names extends string = string, Data extends Dict = Dict> {
	e: Dict<TinyEvent[]>
	on<Name extends Names>(name: Name, listener: () => void): this
	on<Name extends keyof Data>(name: Name, listener: (data: Data[Name]) => void): this
	once<Name extends Names>(name: Name, listener: () => void): this
	once<Name extends keyof Data>(name: Name, listener: (data: Data[Name]) => void): this
	off<Name extends Names>(name: Name, listener: () => void): this
	off<Name extends keyof Data>(name: Name, listener?: (data?: Data[Name]) => void): this
	emit<Name extends Names>(name: Name): this
	emit<Name extends keyof Data>(name: Name, ...data: Data[Name][]): this

	eventNames<Name extends Names>(): Name[]
	eventNames<Name extends keyof Data>(): Name[]
	listeners<Name extends Names>(name?: Name): Name[]
	listeners<Name extends keyof Data>(name?: Name): Name[]

}

class Emitter<Names extends string = string, Data extends Dict = Dict> extends TinyEmitter {

	eventNames() {
		return Object.keys(this.e)
	}
	listeners<Name extends Names>(name: Name): Name[] {
		if (event) return this.e[name].map(v => v.fn) as any

		// if (!event) return this.eventNames().map(event => this.e[event].fn)
	}
	listenerCount(event?: E): number {
		return this.e[event as any].length
	}

	removeAllListeners(event?: E) {

	}

}

export default Emitter



let emitter = new Emitter<'open' | 'close' | 'error' | 'message', { closing: boolean }>()
let names = emitter.listeners()

emitter.on('closing', function(value) {

})



// declare namespace TinyEmitter {
// 	interface Event<D> {
// 		fn: Listener<D>
// 		ctx: any
// 	}
// 	type Listener<D> = (...args: D[]) => void
// }

// declare class TinyEmitter<E = string, D = any> {
// 	e: { [event: string]: TinyEmitter.Event<D>[] }
// 	on(event: E, listener: TinyEmitter.Listener<D>, ctx?: any): this
// 	once(event: E, listener: TinyEmitter.Listener<D>, ctx?: any): this
// 	emit(event: E, ...args: D[]): this
// 	off(event: E, listener?: TinyEmitter.Listener<D>): this
// }

// declare module 'tiny-emitter' {
// 	export = TinyEmitter
// }





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


