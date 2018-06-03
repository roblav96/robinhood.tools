// 



declare function applycookies(): void

declare namespace NodeJS {
	interface Global { Zousan: any }
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production'
		DEVELOPMENT: any
		PRODUCTION: any
		VERSION: any
		DOMAIN: any
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


