// 

import * as http from 'http'
import * as got from 'got'
import * as retryable from 'is-retry-allowed'
import clock from './clock'



export function config() {
	return {
		json: true,
		silent: true,
		timeout: 10000,
		retries: process.env.CLIENT ? 0 : 5,
		retryTick: '5s',
		agent: new http.Agent({ keepAlive: false }),
	} as Http.Config
}



export function send(config: Http.Config) {
	return got(config.url, config).then(({ body }) => body).catch(function(error: got.GotError) {
		if (config.retries > 0 && retryable(error)) {
			config.retries--
			if (process.env.DEVELOPMENT) {
				// console.error('http got retry Error ->', error)
				// console.warn('http got config.retries ->', config.retries)
			}
			return clock.toPromise(config.retryTick).then(() => send(config))
		}
		return Promise.reject(error)
	})
}





declare global {
	namespace Http {
		interface Config extends got.GotJSONOptions {
			retries: number
			retryTick: Clock.Tick
			url: string
			query: any
			silent: boolean
			isProxy: boolean
			robinhoodToken: string
			webullAuth: boolean
		}
	}
}



