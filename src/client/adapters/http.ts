// 
export * from '@/common/http'
// 

import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import got from 'got'
import url from 'url'
import * as security from '@/client/services/security'
import * as http from '@/common/http'
import vm from '@/client/vm'



export function request(config: Partial<Http.Config>): Promise<any> {
	return Promise.resolve().then(function() {
		config.json = true

		if (config.isProxy) {
			config.body = core.json.clone(config)
			config.method = 'POST'
			config.url = '/proxy'
		}

		_.defaults(config, {
			headers: {},
		} as Partial<Http.Config>, http.config())

		if (!config.silent) {
			let ending = (config.query || config.body) ? ' ➤ ' + (JSON.stringify(config.query || config.body || '')).substring(0, 64) : ''
			console.log('➤ ' + config.method + ' ' + config.url + ending);
		}

		if (config.url[0] == '/') {
			config.url = process.DOMAIN + '/api' + config.url
			_.defaults(config.headers, security.headers())
		}

		return config

	}).then(http.send).catch(function(error) {

		// console.error('http error.message Error ->', error.message)
		let message = _.get(error, 'statusMessage', error.message) as string
		let payload = _.get(error, 'response.body') as Http.Payload
		if (payload && payload.message) {
			let extra = payload.attributes ? JSON.stringify(payload.attributes) : payload.message
			message += `: "${extra}"`
		}

		let method = _.get(error, 'method', config.method)
		let url = _.get(error, 'url', config.url).replace(process.DOMAIN, '')
		console.log('%c◀ ' + '[' + method + '] ' + url, 'color: red; font-weight: bolder;', message)
		vm.$toast.open({ message: url + ' ➤ ' + message, type: 'is-danger' })

		return Promise.reject(error)

	})

}

export function get<T = any>(url: string, config = {} as Partial<Http.Config>): Promise<T> {
	config.url = url
	config.method = 'GET'
	return request(config)
}

export function post<B = any, T = any>(url: string, body?: B, config = {} as Partial<Http.Config>): Promise<T> {
	config.url = url
	config.method = 'POST'
	if (body) config.body = body as any;
	return request(config)
}




