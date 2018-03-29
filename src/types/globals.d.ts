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
		INSPECTING: string
	}
	export interface Process {
		EE4: ee4.EventEmitter
		NAME: string
		VERSION: string
		DOMAIN: string
		HOST: string
		PORT: number
		CLIENT: boolean
		SERVER: boolean
		INSTANCE: number
		INSTANCES: number
		MASTER: boolean
		WORKER: boolean
		PRIMARY: boolean
	}
}



interface Console {
	format(args: any): void
}

interface Dict<T = any> {
	[key: string]: T
	[key: number]: T
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


