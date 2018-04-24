// 



declare namespace NodeJS {
	export interface ProcessEnv {
		NODE_ENV: 'development' | 'production'
		DEVELOPMENT: any // string // boolean
		PRODUCTION: any // string // boolean
		NAME: any // string
		VERSION: any // string
		DOMAIN: any // string
		CLIENT: any // string // boolean
		SERVER: any // string // boolean
		PROJECT: any // string
		HOST: any // string
		PORT: any // string // number
		MASTER: any // string // boolean
		WORKER: any // string // boolean
		PRIMARY: any // string // boolean
		INSTANCES: any // string // number
		INSTANCE: any // string // number
		DEBUGGER: any // string // boolean
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
	keys(): string[]
}
interface NodeRequire {
	context(path: string, descending: boolean, regex: RegExp): WebpackRequireContext
}


