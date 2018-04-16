// 



declare module 'eventemitter3' {

	namespace EventEmitter3 {
		type Listener<Data = any> = (...args: Data[]) => void
		interface Event<Data = any> {
			fn: Listener<Data>
			context: any
			once: boolean
		}
	}

	class EventEmitter3<Names extends string = string, Data = any> {
		static prefixed: string | boolean
		protected _events: { [name: string]: EventEmitter3.Event<Data> | EventEmitter3.Event<Data>[] }
		eventNames<Name extends Names>(): Name[]
		listeners<Name extends Names>(name?: Name): EventEmitter3.Listener<Data>[]
		listenerCount<Name extends Names>(name?: Name): number
		emit<Name extends Names>(name: Name, ...args: Data[]): boolean
		on<Name extends Names>(name: Name, listener: EventEmitter3.Listener<Data>, context?: any): this
		addListener<Name extends Names>(name: Name, listener: EventEmitter3.Listener<Data>, context?: any): this
		once<Name extends Names>(name: Name, listener: EventEmitter3.Listener<Data>, context?: any): this
		removeListener<Name extends Names>(name: Name, listener?: EventEmitter3.Listener<Data>, context?: any, once?: boolean): this
		off<Name extends Names>(name: Name, listener?: EventEmitter3.Listener<Data>, context?: any, once?: boolean): this
		removeAllListeners<Name extends Names>(name?: Name): this
	}

	export = EventEmitter3

}


