// 

declare namespace EventEmitter {
	interface Event<D> {
		listener: Listener<D>
		context?: any
		once?: boolean
	}
	interface HandlerEvent<E, D> extends Event<D> {
		event: E
	}
	type Events<D> = { [event: string]: Event<D> }
	type Listener<D> = (...args: D[]) => void
	class EventEmitter<E, D> {
		static prefixed: string | boolean
		protected _events: Events<D>
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


