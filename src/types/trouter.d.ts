// 

declare module 'trouter' {

	namespace Trouter {
		type Method = 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE' | 'OPTIONS'
		interface Found<Handler> {
			params: { [key: string]: string }
			handler: Handler
		}
		class Trouter<Handler, Options> {
			constructor(options?: Options)
			opts: Options
			handlers: { [method: string]: { [pattern: string]: Handler } }
			routes: { [method: string]: any[] }
			add(method: Method, pattern: string, handler: Handler): this
			find(method: Method, url: string): Found<Handler> | boolean
			get(pattern: string, fn: Handler): void
			post(pattern: string, fn: Handler): void
			put(pattern: string, fn: Handler): void
			head(pattern: string, fn: Handler): void
			patch(pattern: string, fn: Handler): void
			delete(pattern: string, fn: Handler): void
			options(pattern: string, fn: Handler): void
		}
	}
	interface Trouter<Handler, Options> extends Trouter.Trouter<Handler, Options> { }
	class Trouter<Handler = (...args: any[]) => void, Options = {}> { }
	export = Trouter

}


