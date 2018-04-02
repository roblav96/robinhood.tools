// 



declare namespace ee3 {
	type Listener<D> = (...args: D[]) => void
	interface Event<D> { listener: Listener<D>, context?: any, once?: boolean, name?: string }
	class EventEmitter<E = string, D = any> {
		static prefixed: string | boolean
		protected _events: Dict<Event<D>>
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
	export = ee3
}


