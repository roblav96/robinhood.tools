// 

import * as _ from './lodash'
import * as qs from 'querystring'
import * as fastjsonparse from 'fast-json-parse'
import * as simple from 'simple-get'
import * as boom from 'boom'
import clock from './clock'



export function config(config: Partial<Http.Config>) {

	_.defaults(config, {
		headers: {},
		verbose: false,
		debug: false,
		timeout: 10000,
		retries: process.env.CLIENT ? 0 : 3,
		retryTick: '3s',
		maxRedirects: 10,
	} as Http.Config)

	if (process.env.CLIENT && config.retries == Infinity) config.retryTick = '1s';

	if (config.verbose || config.debug) {
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
	if (config.debug) console.log('config ->', config);
	return new Promise(function(resolve, reject) {
		simple.concat(config, function(error, res, data: any) {
			if (error && !res) return reject(error);
			if (data) {
				data = data.toString()
				let type = res.headers['content-type']
				if (type && type.includes('application/json')) {
					let parsed = fastjsonparse(data)
					if (parsed.err) {
						return reject(new boom(parsed.err, {
							statusCode: 422,
							message: parsed.err.message,
							data: { data, config: _.pick(config, ['method', 'url']) },
						}))
					}
					data = parsed.value
				}
			}
			// console.log('error ->', JSON.stringify(error, null, 4))
			// console.info('error ->', error)
			// console.dir(error)
			// console.log('res ->', res)
			// console.log('data ->', data)
			if (error || res.statusCode >= 400) {
				// console.log('error ->', error)
				return reject(new boom(error || res.statusMessage, {
					statusCode: res.statusCode,
					message: error ? error.message : res.statusMessage,
					data: { data, config: _.pick(config, ['method', 'url']) },
				}))
			}

			if (config.verbose || config.debug) {
				let ending = (config.query || config.body) ? ' <- ' + (JSON.stringify(config.query || config.body || '')).substring(0, 64) : ''
				console.info('<- ' + config.method + ' ' + config.url + ending);
			}

			resolve(data)
		})
	}).catch(function(error) {
		let reject = boom.isBoom(error) && [401, 500].includes(error.output.statusCode)
		if (!reject && config.retries > 0) {
			config.retries--
			if (process.env.DEVELOPMENT && process.env.SERVER) {
				console.warn('retry Error ->', config, error)
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
			debug: boolean
			isProxy: boolean
			rhtoken: string
			wbauth: boolean
		}
	}
}


