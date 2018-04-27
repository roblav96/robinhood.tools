// 

declare module 'trouter' {

	type Methods = 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE' | 'OPTIONS'
	interface Found<Handler, Params> {
		params: Params
		handler: Handler
	}
	namespace Trouter { }
	class Trouter<Handler = (...args: any[]) => void, Options = object> {
		constructor(options?: Options)
		opts: Options
		handlers: { [method: string]: { [pattern: string]: Handler } }
		routes: { [method: string]: object[] }
		add(method: Methods, pattern: string, handler: Handler): this
		find<Params = object>(method: Methods, url: string): Found<Handler, Params> | boolean
		get(pattern: string, fn: Handler): void
		post(pattern: string, fn: Handler): void
		put(pattern: string, fn: Handler): void
		head(pattern: string, fn: Handler): void
		patch(pattern: string, fn: Handler): void
		delete(pattern: string, fn: Handler): void
		options(pattern: string, fn: Handler): void
	}
	export = Trouter

}


