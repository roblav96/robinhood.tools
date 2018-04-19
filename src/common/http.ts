// 

import * as stream from 'stream'
import * as got from 'got'
import * as boom from 'boom'
import * as retryable from 'is-retry-allowed'
import * as R from './rambdax'
import clock from './clock'



export function config() {
	return {
		json: true,
		silent: true,
		timeout: 10000,
		retries: 5,
		retryTick: '5s',
	} as Http.Config
}



export function send(config: Http.Config) {
	return got(config.url, config).then(function({ body }) {
		return body
	}).catch(function(error: got.GotError) {
		if (config.retries > 0 && retryable(error)) {
			config.retries--
			if (DEVELOPMENT) {
				console.error('http Error ->', error)
				console.warn('http retry ->', config.retries)
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
		interface Payload extends boom.Payload {

		}
		interface GotResponse<T = any> extends got.Response<T>, stream.PassThrough {

		}
		interface GotError<T = any> extends Error {
			name: string
			host: string
			hostname: string
			method: string
			path: string
			protocol: string
			url: string
			statusCode: number,
			statusMessage: string
			headers: Dict<string>
			response: GotResponse<T>
		}
	}
}



