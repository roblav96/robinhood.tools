// 

declare namespace TinyEmitter {
	type Listener<Data = any> = (...args: Data[]) => void
	interface Event<Data = any> {
		fn: Listener<Data>
		ctx: any
	}
}

declare class TinyEmitter<Names extends string = string, Data = any> {
	protected e: { [name: string]: TinyEmitter.Event<Data>[] }
	on<Name extends Names>(name: Name, listener: TinyEmitter.Listener<Data>, ctx?: any): this
	once<Name extends Names>(name: Name, listener: TinyEmitter.Listener<Data>, ctx?: any): this
	emit<Name extends Names>(name: Name, ...args: Data[]): this
	off<Name extends Names>(name: Name, listener?: TinyEmitter.Listener<Data>): this
}

declare module 'tiny-emitter' {
	export = TinyEmitter
}


