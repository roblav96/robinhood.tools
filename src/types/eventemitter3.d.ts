// 



declare namespace ee3 {
	export type Handler = (...args: any[]) => void
	export interface Event { handler: Handler, context?: any, once?: boolean }
	export class EventEmitter<E = string> {
		static prefixed: string | boolean
		protected _events: Dict<Event>
		eventNames(): E[]
		listeners(event: E): Handler[]
		listenerCount(event: E): number
		emit(event: E, ...args: any[]): boolean
		on(event: E, handler: Handler, context?: any): this
		addListener(event: E, handler: Handler, context?: any): this
		once(event: E, handler: Handler, context?: any): this
		removeListener(event: E, handler?: Handler, context?: any, once?: boolean): this
		off(event: E, handler?: Handler, context?: any, once?: boolean): this
		removeAllListeners(event?: E): this
		// eventNames(): E[]
		// listeners(event: E): ((...args: any[]) => void)[]
		// listenerCount(event: E): number
		// emit(event: E, ...args: any[]): boolean
		// on(event: E, handler: (...args: any[]) => void, context?: any): this
		// addListener(event: E, handler: (...args: any[]) => void, context?: any): this
		// once(event: E, handler: (...args: any[]) => void, context?: any): this
		// removeListener(event: E, handler?: (...args: any[]) => void, context?: any, once?: boolean): this
		// off(event: E, handler?: (...args: any[]) => void, context?: any, once?: boolean): this
		// removeAllListeners(event?: E): this
	}
}

declare module 'eventemitter3' {
	export = ee3
}


