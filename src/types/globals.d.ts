// 



declare const NODE_ENV: 'development' | 'production'
declare const DEVELOPMENT: boolean
declare const PRODUCTION: boolean

declare namespace NodeJS {
	interface Global {
		NODE_ENV: typeof NODE_ENV
		DEVELOPMENT: typeof DEVELOPMENT
		PRODUCTION: typeof PRODUCTION
	}
	// interface ProcessEnv {
	// 	NODE_ENV: 'development' | 'production'
	// }
}



interface Dict<T = any> {
	[key: string]: T
	[key: number]: T
}




