// 



declare namespace ee3 {
	export class EventEmitter<E = string, D = any> {
		static prefixed: string | boolean
		_events: { [event: string]: { fn: (...args: D[]) => void, context: any, once: boolean } }
		eventNames(): E[]
		listeners(event: E): ((...args: D[]) => void)[]
		listenerCount(event: E): number
		emit(event: E, ...args: D[]): boolean
		on(event: E, fn: (...args: D[]) => void, context?: any): this
		addListener(event: E, fn: (...args: D[]) => void, context?: any): this
		once(event: E, fn: (...args: D[]) => void, context?: any): this
		removeListener(event: E, fn?: (...args: D[]) => void, context?: any, once?: boolean): this
		off(event: E, fn?: (...args: D[]) => void, context?: any, once?: boolean): this
		removeAllListeners(event?: E): this
	}
}

declare module 'eventemitter3' {
	export = ee3
}


