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
		EE3: ee3.EventEmitter
		dtsgen: (name: string, input: any) => void
		clipboard: (name: string, input: string) => void
		HOST: string
		PORT: number
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


