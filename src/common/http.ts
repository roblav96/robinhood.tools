// 

import * as got from 'got'
import * as retryable from 'is-retry-allowed'
import clock from './clock'



export function config() {
	return {
		json: true,
		silent: true,
		timeout: 10000,
		retries: process.env.CLIENT ? 1 : 5,
		retryTick: '5s',
	} as Http.Config
}



export function send(config: Http.Config) {
	if (!Number.isFinite(config._retries)) {
		config._retries = config.retries
		config.retries = 0
	}
	return got(config.url, config).then(({ body }) => body).catch(function(error: got.GotError) {
		if (config._retries > 0 && retryable(error)) {
			config._retries--
			if (process.env.DEVELOPMENT) {
				// console.error('http got retry Error ->', error)
				// console.warn('http got config._retries ->', config._retries)
			}
			return clock.toPromise(config.retryTick).then(() => send(config))
			// let ms = 1000 + Math.round(Math.random() * 4000)
			// return Promise.delay(ms).then(() => send(config))
		}
		return Promise.reject(error)
	})
}





declare global {
	namespace Http {
		interface Config extends got.GotJSONOptions {
			retries: number
			_retries: number
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



