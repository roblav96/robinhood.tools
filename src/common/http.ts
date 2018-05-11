// 

import * as _ from './lodash'
import * as qs from 'querystring'
import * as fastjsonparse from 'fast-json-parse'
import * as simple from 'simple-get'
import * as retryable from 'is-retry-allowed'
import * as boom from 'boom'
import clock from './clock'



export function config(config: Partial<Http.Config>) {

	_.defaults(config, {
		headers: {},
		verbose: false,
		timeout: 10000,
		retries: process.env.CLIENT ? 0 : 5,
		retryTick: '3s',
		maxRedirects: 10,
	} as Http.Config)

	if (process.env.CLIENT && config.retries == Infinity) config.retryTick = '1s';

	if (config.verbose) {
		let ending = (config.query || config.body) ? ' -> ' + (JSON.stringify(config.query || config.body || '')).substring(0, 64) : ''
		console.log('-> ' + config.method + ' ' + config.url + ending);
	}

	if (config.query) {
		config.url += `?${qs.stringify(config.query)}`
		delete config.query
	}

	if (config.body) {
		config.headers['accept'] = 'application/json'
		config.headers['content-type'] = 'application/json'
		config.body = JSON.stringify(config.body)
	}

	return config
}



export function send(config: Http.Config) {
	// console.log('config ->', config)
	return new Promise(function(resolve, reject) {
		simple.concat(config, function(error, res, data) {
			if (error && !res) return reject(error);
			if (data) {
				data = data.toString()
				let type = res.headers['content-type']
				if (type && type.includes('application/json')) {
					data = JSON.parse(data)
				}
			}
			// console.info('error ->')
			// console.dir(error)
			// console.log('res ->', res)
			// console.log('data ->', data)
			if (error || res.statusCode >= 400) {
				return reject(new boom(error, {
					statusCode: res.statusCode,
					message: res.statusMessage || error.message,
					decorate: { data },
				}))
			}

			if (config.verbose) {
				let ending = (config.query || config.body) ? ' <- ' + (JSON.stringify(config.query || config.body || '')).substring(0, 64) : ''
				console.info('<- ' + config.method + ' ' + config.url + ending);
			}

			resolve(data)
		})
	}).catch(function(error) {
		if (config.retries > 0) {
			config.retries--
			if (process.env.DEVELOPMENT && process.env.SERVER) {
				console.error('retry Error ->', error)
				console.warn('retry config ->', config)
				// console.warn('retry config.retries ->', config.retries)
			}
			return clock.toPromise(config.retryTick).then(() => send(config))
		}
		return Promise.reject(error)
	})
}





import { IncomingHttpHeaders } from 'http'
declare global {
	namespace Http {
		interface Headers extends IncomingHttpHeaders {
			[key: string]: any
		}
		interface Config extends simple.RequestOptions {
			headers: Headers
			query: any
			retries: number
			retryTick: Clock.Tick
			verbose: boolean
			isProxy: boolean
			robinhoodToken: string
			wbauth: boolean
		}
	}
}



