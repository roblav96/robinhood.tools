// 

import * as ee3 from 'eventemitter3'



export default class Emitter<Names extends string = string, Data = any> extends ee3.EventEmitter<Names, Data> {

	offListener(listener: ee3.Listener<Data>, context?: any, once?: boolean): this {
		this.eventNames().forEach(name => {
			console.log('name ->', name)
			this.listeners(name).forEach(fn => {
				console.log('fn ->', fn)
				if (listener == fn) {
					console.warn('removeListener ->', name, listener)
					this.removeListener(name, listener, context, once)
				}
			})
		})
		return this
	}

}







// import * as ti from 'tiny-emitter'

// export class TinyEmitter<Names extends string = string, Data = any> extends ti<Names, Data> {
// 	// off<Name extends Names>(name: Name, listener?: TinyEmitter.Listener<Data>): this
// 	eventNames<Name extends Names>() {
// 		let e = this.e || (this.e = {})
// 		return Object.keys(e) as Name[]
// 	}
// 	removeListener<Name extends Names>(listener: ti.Listener<Data>) {
// 		let e = this.e || (this.e = {})
// 		let names = Object.keys(e) as Name[]
// 		if (names.length == 0) return this;
// 		names.forEach(name => {
// 			e[name].forEach(event => {
// 				if (listener == event.fn) {
// 					console.warn('off ->', name, listener)
// 					this.off(name, listener)
// 				}
// 			})
// 		})
// 		return this
// 	}
// 	removeAllListeners(name?: Names) {
// 		if (!this.e) return this;
		
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


