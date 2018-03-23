// 



declare namespace ee3 {
	export class EventEmitter<E = string, D = any> {
		static prefixed: string | boolean
		eventNames(): Array<E>
		listeners(event: E): Array<(...args: Array<D>) => void>
		listenerCount(event: E): number
		emit(event: E, ...args: Array<D>): boolean
		on(event: E, fn: (...args: Array<D>) => void, context?: any): this
		addListener(event: E, fn: (...args: Array<D>) => void, context?: any): this
		once(event: E, fn: (...args: Array<D>) => void, context?: any): this
		removeListener(event: E, fn?: (...args: Array<D>) => void, context?: any, once?: boolean): this
		off(event: E, fn?: (...args: Array<D>) => void, context?: any, once?: boolean): this
		removeAllListeners(event?: E): this
	}
}

declare module 'eventemitter3' {
	export = ee3
}


