// 

declare module 'trouter' {

	namespace Trouter {
		type Methods = 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE' | 'OPTIONS'
		interface Found<Handler, Params> {
			params: Params
			handler: Handler
		}
	}
	class Trouter<Handler = (...args: any[]) => void, Options = any> {
		constructor(options?: Options)
		opts: Options
		handlers: { [method: string]: { [pattern: string]: Handler } }
		routes: { [method: string]: any[] }
		add(method: Trouter.Methods, pattern: string, handler: Handler): this
		find<Params = any>(method: Trouter.Methods, url: string): Trouter.Found<Handler, Params> | boolean
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


