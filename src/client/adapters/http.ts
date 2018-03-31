// 

import * as _ from 'lodash'
import * as core from '@/common/core'
import got from 'got'
import vm from '@/client/vm'
import * as security from '@/client/services/security'



function request(config: Partial<Http.RequestConfig>): Promise<any> {
	return Promise.resolve().then(function() {
		config.json = true

		if (config.isProxy) {
			config.body = core.json.clone(config)
			config.method = 'POST'
			config.url = '/proxy'
		}

		_.defaults(config, {
			timeout: 10000,
			retries: 9,
			silent: PRODUCTION,
			headers: {},
		} as Http.RequestConfig)

		if (!config.silent) {
			let ending = (config.query || config.body) ? ' ➤ ' + (JSON.stringify(config.query || config.body || '')).substring(0, 64) : ''
			console.log('➤ ' + config.method + ' ' + config.url + ending);
		}

		_.defaults(config.headers, security.headers())

		if (config.url[0] == '/') {
			config.url = process.DOMAIN + '/api' + config.url
		}
		
		console.log('config ->', JSON.stringify(config, null, 4))

		return got(config.url, config as any).then(({ body }) => body)

	}).catch(function(error: got.GotError) {
		
		console.log('got error ->', error)
		
		let message = _.get(error, 'statusMessage', error.message)
		if (_.has(error, 'response.body.message') && error.response.body.message != message) {
			message += `: "${error.response.body.message}"`
		}

		let method = _.get(error, 'method', config.method)
		let url = _.get(error, 'url', config.url).replace(process.DOMAIN, '')
		console.log('%c◀ ' + '[' + method + '] ' + url, 'color: red; font-weight: bolder;', message)
		vm.$toast.open({ message: url + ' ➤ ' + message, type: 'is-danger' })

		return Promise.reject(message)

	})

}

export function get<T = any>(url: string, config = {} as Partial<Http.RequestConfig>): Promise<T> {
	config.url = url
	config.method = 'GET'
	return request(config)
}

export function post<B = any, T = any>(url: string, body?: B, config = {} as Partial<Http.RequestConfig>): Promise<T> {
	config.url = url
	config.method = 'POST'
	if (body) config.body = body as any;
	return request(config)
}





declare global {
	namespace Http {
		interface RequestConfig extends got.GotJSONOptions {
			url: string
			query: any
			silent: boolean
			isProxy: boolean
		}
	}
}


