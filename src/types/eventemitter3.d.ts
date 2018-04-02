// 

declare namespace EventEmitter {
	interface Event<D> {
		fn: Listener<D>
		context: any
		once: boolean
		event?: string
	}
	type Listener<D> = (...args: D[]) => void
	class EventEmitter<E, D> {
		static prefixed: string | boolean
		protected _events: Dict<Event<D> | Event<D>[]>
		eventNames(): E[]
		listeners(event: E): Listener<D>[]
		listenerCount(event: E): number
		emit(event: E, ...args: D[]): boolean
		on(event: E, listener: Listener<D>, context?: any): this
		addListener(event: E, listener: Listener<D>, context?: any): this
		once(event: E, listener: Listener<D>, context?: any): this
		removeListener(event: E, listener?: Listener<D>, context?: any, once?: boolean): this
		off(event: E, listener?: Listener<D>, context?: any, once?: boolean): this
		removeAllListeners(event?: E): this
	}
}

declare module 'eventemitter3' {
	export = EventEmitter
}


