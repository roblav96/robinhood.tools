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
	// interface Process extends ProcessEnv {
	interface Process {
		DNAME: string
		VERSION: string
		DOMAIN: string
		dtsgen: (name: string, value: any) => void
		clipboard: (name: string, input: string) => void
		HOST: string
		PORT: number
		INSTANCE: number
		INSTANCES: number
		MASTER: boolean
		WORKER: boolean
		PRIMARY: boolean
	}
	// interface ProcessEnv {
	// 	NODE_ENV: 'development' | 'production'
	// }
}



interface Console {
	format(args: any): any
}

interface Dict<T = any> {
	[key: string]: T
	[key: number]: T
}


