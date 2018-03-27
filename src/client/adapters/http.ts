// 

import * as _ from 'lodash'
import * as core from '@/common/core'
import got from 'got'
import vm from '@/client/vm'
import * as security from '@/client/services/security'



function request(config: Partial<Http.RequestConfig>): Promise<any> {
	return Promise.resolve().then(function() {
		config.json = true

		if (config.corsproxy) {
			config.body = core.json.clone(config)
			return got.post(process.DOMAIN + '/api/proxy', config as any).then(({ body }) => body)
		}

		config.timeout = config.timeout || 10000
		config.retries = config.retries || 9
		config.silent = config.silent || PRODUCTION
		if (!config.silent) {
			let ending = (config.query || config.body) ? ' ➤ ' + (JSON.stringify(config.query || config.body || '')).substring(0, 64) : ''
			console.log('➤ ' + config.method + ' ' + config.url + ending);
		}

		if (config.url[0] == '/') {
			config.headers = config.headers || {}
			_.defaults(config.headers, security.headers())
			config.url = process.DOMAIN + '/api' + config.url
		}

		return got(config.url, config as any).then(({ body }) => body)

	}).catch(function(error: got.GotError) {
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

export function get<Q = any, T = any>(url: string, query?: Q, config = {} as Partial<Http.RequestConfig>): Promise<T> {
	config.url = url
	config.method = 'GET'
	if (query) config.query = query;
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
			corsproxy: boolean
		}
	}
}


