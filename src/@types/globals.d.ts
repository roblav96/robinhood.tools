// 



declare let NODE_ENV: 'development' | 'production'
declare let DEVELOPMENT: boolean
declare let PRODUCTION: boolean
declare let DOMAIN: string
declare let VERSION: string
declare let INSTANCE: number
declare let INSTANCES: number
declare let MASTER: boolean
declare let WORKER: boolean
declare let PRIMARY: boolean
declare let EE3: EventEmitter

declare namespace NodeJS {
	interface Global {
		NODE_ENV: typeof NODE_ENV
		DEVELOPMENT: typeof DEVELOPMENT
		PRODUCTION: typeof PRODUCTION
		DOMAIN: typeof DOMAIN
		VERSION: typeof VERSION
		INSTANCE: typeof INSTANCE
		INSTANCES: typeof INSTANCES
		MASTER: typeof MASTER
		WORKER: typeof WORKER
		PRIMARY: typeof PRIMARY
		EE3: typeof EE3
	}
}



interface Console {
	format(c: any): any
}

interface Dict<T = any> {
	[key: string]: T
	[key: number]: T
}



