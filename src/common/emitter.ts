// 

import * as TinyEmitter from 'tiny-emitter'
import * as pEvent from 'p-event'



export default class Emitter<Names extends string = string, Data = any> extends TinyEmitter<Names, Data> {

	private get _e() { return this.e || (this.e = {}) }
	get names() { return Object.keys(this._e) as Names[] }

	offListener<Name extends Names>(listener: TinyEmitter.Listener<Data>) {
		let e = this._e
		Object.keys(e).forEach((name: Names) => { e[name].forEach(event => { this.off(name, listener) }) })
		return this
	}

	offAll<Name extends Names>() {
		let e = this._e
		Object.keys(e).forEach((name: Names) => { this.off(name) })
		delete this.e
		return this
	}

	toPromise<Name extends Names>(name: Names) {
		return pEvent(this, name)
	}

	eachEvent<Name extends Names>(fn: (event: TinyEmitter.Event<Data>, index: number) => void) {
		let e = this._e; let i = 0;
		Object.keys(e).forEach(function(name: Names) {
			e[name].forEach(function(event) {
				fn(event, i); i++;
			})
		})
	}

}




// console.log('clock ->', console.dump(clock, { depth: 8 }))

// function first(i) { }
// clock.on('1s', first)
// function second(i) { }
// clock.on('2s', second)
// function third(i) { }
// clock.on('1s', third)

// clock.eachEvent(function(event, i) {
// 	console.log('i ->', i, 'event ->', event)
// })

// // console.log('clock.ee ->', clock.ee)
// // clock.offAll()
// // console.log('clock.ee ->', clock.ee)

// console.log('clock ->', console.dump(clock, { depth: 8 }))





// import * as EventEmitter from 'eventemitter3'
// export default class Emitter<Names extends string = string, Data = any> extends EventEmitter<Names, Data> {

// 	offListener(listener: EventEmitter.Listener<Data>, context?: any, once?: boolean): this {
// 		this.eventNames().forEach(name => {
// 			this.listeners(name).forEach(fn => {
// 				if (listener == fn) {
// 					console.warn('removeListener ->', name, listener)
// 					this.removeListener(name, listener, context, once)
// 				}
// 			})
// 		})
// 		return this
// 	}

// }







// import * as _ from 'lodash'
// import * as TinyEmitter from 'tiny-emitter'
// type TinyListener<Data = any> = (...args: Data[]) => void
// interface TinyEvent<Data = any> { listener: TinyListener<Data>, ctx: any }
// interface Datas<T = any> { [name: string]: T }

// interface Emitter<Names extends string = string, Data extends Datas = Datas> {
// 	e: { [name: string]: TinyEvent<Data>[] }
// 	on<Name extends Names>(name: Name, listener: () => void): this
// 	on<Name extends keyof Data>(name: Name, listener: (data: Data[Name]) => void): this
// 	once<Name extends Names>(name: Name, listener: () => void): this
// 	once<Name extends keyof Data>(name: Name, listener: (data: Data[Name]) => void): this
// 	off<Name extends Names>(name: Name, listener: () => void): this
// 	off<Name extends keyof Data>(name: Name, listener?: (data?: Data[Name]) => void): this
// 	emit<Name extends Names>(name: Name): this
// 	emit<Name extends keyof Data>(name: Name, ...data: Data[Name][]): this
// 	// 
// 	eventNames<Name extends Names>(): Name[]
// 	eventNames<Name extends keyof Data>(): Name[]

// 	listeners<Name extends Names>(name?: Name): (() => void)[]
// 	listeners<Name extends keyof Data>(name?: Name): ((data?: Data[Name]) => void)[]

// }

// class Emitter<Names extends string = string, Data extends Datas = Datas> extends TinyEmitter {

// 	eventNames() {
// 		return !this.e ? [] : Object.keys(this.e)
// 	}
// 	listeners(name?: string) {
// 		if (name) {
// 			return (!this.e || _.isEmpty(this.e[name])) ? [] : this.e[name].map(event => {
// 				return event.listener
// 			})
// 		}

// 		// if (!event) return this.eventNames().map(event => this.e[event].fn)
// 	}
// 	listenerCount(event?: E): number {
// 		return this.e[event as any].length
// 	}

// 	removeAllListeners(event?: E) {

// 	}

// }

// export default Emitter



// let emitter = new Emitter<'open' | 'close' | 'error' | 'message', { closing: boolean }>()

// let names = emitter.eventNames()
// console.log('names ->', names)
// let listeners = emitter.listeners()
// console.log('listeners ->', listeners)

// emitter.on('close', function(value) {

// })

// console.log('emitter ->', console.dump(emitter))



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


