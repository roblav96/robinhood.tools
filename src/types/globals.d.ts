// 



declare namespace NodeJS {
	interface Global { Zousan: any }
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
	addDisposeHandler(callback: any): void
	addStatusHandler(l: any): void
	apply(options: any): any
	check(apply: any): any
	decline(dep: any): void
	dispose(callback: any): void
	removeDisposeHandler(callback: any): void
	removeStatusHandler(l: any): void
	status(l: any): any
}


