// 



declare let NODE_ENV: 'development' | 'production'
declare let DEVELOPMENT: boolean
declare let PRODUCTION: boolean
declare let DOMAIN: string

declare namespace NodeJS {
	interface Global {
		NODE_ENV: typeof NODE_ENV
		DEVELOPMENT: typeof DEVELOPMENT
		PRODUCTION: typeof PRODUCTION
		DOMAIN: typeof DOMAIN
	}
}


