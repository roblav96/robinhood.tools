// 



declare namespace NodeJS {
	export interface Global { Zousan: any }
	export interface ProcessEnv {
		NODE_ENV: 'development' | 'production'
		DEVELOPMENT: any
		PRODUCTION: any
		NAME: any
		VERSION: any
		DOMAIN: any
		CLIENT: any
		SERVER: any
		PROJECT: any
		DEBUGGER: any
		APPLICATION: any
		APPLICATIONS: any
		HOST: any
		PORT: any
		MASTER: any
		WORKER: any
		PRIMARY: any
		INSTANCE: any
		INSTANCES: any
		SYMBOLS: SymbolsTypes
		// OFFSET: any
		// FIRST: any
		// ORDER: any
		// SCALE: any
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


