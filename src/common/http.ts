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
		retries: process.env.CLIENT ? 0 : 3,
		retryTick: '5s',
		maxRedirects: 10,
	} as Http.Config)

	if (config.verbose) {
		let ending = (config.query || config.body) ? ' ➤ ' + (JSON.stringify(config.query || config.body || '')).substring(0, 64) : ''
		console.log('➤ ' + config.method + ' ' + config.url + ending);
	}

	if (config.query) {
		config.url += '?' + qs.stringify(config.query)
		delete config.query
	}

	if (config.body) {
		config.headers['Accept'] = 'application/json'
		config.headers['Content-Type'] = 'application/json'
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
					let parsed = fastjsonparse(data)
					if (parsed.err) {
						return reject(new boom(parsed.err, {
							statusCode: res.statusCode,
							message: parsed.err.message,
							decorate: { data },
						}))
					}
					if (parsed.value) data = parsed.value;
				}
			}
			// console.info('error ->')
			// console.dir(error)
			// console.log('res ->', res)
			// console.log('data ->', data)
			if (error || res.statusCode >= 400) {
				let boomerror = new boom(error, {
					statusCode: res.statusCode,
					message: res.statusMessage || error.message,
					decorate: { data },
				})
				// console.info('boomerror ->', boomerror)
				// console.dir(boomerror)
				return reject(boomerror)
			}
			resolve(data)
		})
	}).catch(function(error) {
		if (config.retries > 0 && retryable(error)) {
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





declare global {
	namespace Http {
		interface Config extends simple.RequestOptions {
			query: any
			retries: number
			retryTick: Clock.Tick
			hHost: boolean
			hOrigin: boolean
			hReferer: boolean
			verbose: boolean
			isProxy: boolean
			robinhoodToken: string
			webullAuth: boolean
		}
	}
}



