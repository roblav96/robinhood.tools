// 

declare namespace EventEmitter {

	type Listener<Data = any> = (...args: Data[]) => void
	interface Event<Data = any> {
		fn: Listener<Data>
		context: any
		once: boolean
	}

	class EventEmitter<Names extends string = string, Data = any> {
		static prefixed: string | boolean
		protected _events: { [name: string]: Event<Data> | Event<Data>[] }
		eventNames(): Names[]
		listeners(event?: Names): Listener<Data>[]
		listenerCount(event?: Names): number
		emit(event: Names, ...args: any[]): boolean
		on(event: Names, listener: Listener<Data>, context?: any): this
		addListener(event: Names, listener: Listener<Data>, context?: any): this
		once(event: Names, listener: Listener<Data>, context?: any): this
		removeListener(event: Names, listener?: Listener<Data>, context?: any, once?: boolean): this
		off(event: Names, listener?: Listener<Data>, context?: any, once?: boolean): this
		removeAllListeners(event?: Names): this
	}

}

declare module 'eventemitter3' {
	export = EventEmitter
}





// declare namespace EventEmitter {

// 	interface Event<D> {
// 		fn: Listener<D>
// 		context: any
// 		once: boolean
// 		event?: string
// 	}
// 	type Listener<D> = (...args: D[]) => void

// 	class EventEmitter<E extends string = string, D = any> {
// 		static prefixed: string | boolean
// 		protected _events: Dict<Event<D> | Event<D>[]>
// 		eventNames(): E[]
// 		listeners(event: E): Listener<D>[]
// 		listenerCount(event: E): number
// 		emit(event: E, ...args: D[]): boolean
// 		on(event: E, listener: Listener<D>, context?: any): this
// 		addListener(event: E, listener: Listener<D>, context?: any): this
// 		once(event: E, listener: Listener<D>, context?: any): this
// 		removeListener(event: E, listener?: Listener<D>, context?: any, once?: boolean): this
// 		off(event: E, listener?: Listener<D>, context?: any, once?: boolean): this
// 		removeAllListeners(event?: E): this
// 	}

// }


