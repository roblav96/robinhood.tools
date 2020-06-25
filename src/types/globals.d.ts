//

declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production'
		DEVELOPMENT: any
		PRODUCTION: any
		VERSION: string
		DOMAIN: string
		CLIENT: any
		SERVER: any
	}
}

type KeysOf<T> = (keyof T)[]
type PartialDeep<T> = { [P in keyof T]?: PartialDeep<T[P]> }
interface Dict<T = any> {
	[key: string]: T
}

interface WebpackRequireContext {
	(file: string): void
	id: string
	name: string
	resolve: RequireResolve
	keys: () => string[]
}
interface NodeRequire {
	context: (path: string, descending: boolean, regex: RegExp) => WebpackRequireContext
}
interface NodeModule {
	hot: HotNodeModule
}
interface HotNodeModule {
	active: boolean
	data: any
	accept(dep: any, callback: any): void
	addDisposeHandler(fn: (data: object) => void): void
	addStatusHandler(fn: (status: string) => void): void
	apply(options: any): any
	check(apply: any): any
	decline(dep: any): void
	dispose(fn: (data: object) => void): void
	removeDisposeHandler(fn: (data: object) => void): void
	removeStatusHandler(fn: (status: string) => void): void
	status(fn: (status: string) => void): void
}
