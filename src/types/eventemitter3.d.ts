// 



declare namespace ee3 {
	type Listener = (...args: any[]) => void
	interface Event { listener: Listener, context?: any, once?: boolean, name?: string }
	class EventEmitter<E = string> {
		static prefixed: string | boolean
		protected _events: Dict<Event>
		eventNames(): E[]
		listeners(event: E): Listener[]
		listenerCount(event: E): number
		emit(event: E, ...args: any[]): boolean
		on(event: E, listener: Listener, context?: any): this
		addListener(event: E, listener: Listener, context?: any): this
		once(event: E, listener: Listener, context?: any): this
		removeListener(event: E, listener?: Listener, context?: any, once?: boolean): this
		off(event: E, listener?: Listener, context?: any, once?: boolean): this
		removeAllListeners(event?: E): this
	}
}

declare module 'eventemitter3' {
	export = ee3
}


