// 

declare module 'trouter' {

	namespace Trouter {
		type Methods = 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE' | 'OPTIONS'
		interface Found<Handler, Params> {
			params: Params
			handler: Handler
		}
		class Trouter<Handler, Options> {
			constructor(options?: Options)
			opts: Options
			handlers: { [method: string]: { [pattern: string]: Handler } }
			routes: { [method: string]: any[] }
			add(method: Methods, pattern: string, handler: Handler): this
			find<Params = any>(method: Methods, url: string): Found<Handler, Params> | boolean
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

