// 

declare module 'trouter' {

	namespace Trouter {
		type Methods = 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE' | 'OPTIONS'
		interface Found<Handler, Params> {
			params: Params
			handler: Handler
		}
	}
	class Trouter<Handler = (...args: any[]) => void, Options = object> {
		constructor(options?: Options)
		opts: Options
		routes: { [method: string]: object[] }
		handlers: { [method: string]: { [pattern: string]: Handler } }
		add(method: Trouter.Methods, pattern: string, handler: Handler): this
		find<Params = object>(method: Trouter.Methods, url: string): Trouter.Found<Handler, Params> | boolean
	}
	export = Trouter

}


