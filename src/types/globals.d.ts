// 



declare const NODE_ENV: 'development' | 'production'
declare const DEVELOPMENT: boolean
declare const PRODUCTION: boolean

declare namespace NodeJS {
	export interface Global {
		NODE_ENV: typeof NODE_ENV
		DEVELOPMENT: typeof DEVELOPMENT
		PRODUCTION: typeof PRODUCTION
	}
	export interface ProcessEnv {
		NODE_ENV: typeof NODE_ENV
	}
	export interface Process {
		NAME: string
		VERSION: string
		DOMAIN: string
		CLIENT: boolean
		SERVER: boolean
		INSTANCES: number
		INSTANCE: number
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


