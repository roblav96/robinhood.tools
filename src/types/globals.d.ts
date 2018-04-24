// 



declare namespace NodeJS {
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
		HOST: any
		PORT: any
		MASTER: any
		WORKER: any
		PRIMARY: any
		INSTANCES: any
		INSTANCE: any
		DEBUGGER: any
	}
}



type KeysOf<T> = (keyof T)[]

interface Dict<T = any> {
	[key: string]: T
}


