// 

declare namespace TinyEmitter {
	interface Event<D> {
		fn: Listener<D>
		ctx: any
	}
	type Listener<D> = (...args: D[]) => void
}

declare class TinyEmitter<E, D> {
	e: { [event: string]: TinyEmitter.Event<D>[] }
	on(event: E, listener: TinyEmitter.Listener<D>, ctx?: any): this
	once(event: E, listener: TinyEmitter.Listener<D>, ctx?: any): this
	emit(event: E, ...args: D[]): this
	off(event: E, listener?: TinyEmitter.Listener<D>): this
}

declare module 'tiny-emitter' {
	export = TinyEmitter
}


