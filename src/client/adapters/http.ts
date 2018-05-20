// 

export * from '@/common/http'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as http from '@/common/http'
import * as security from '@/client/adapters/security'
import * as alert from '@/client/adapters/alert'
import * as boom from 'boom'
import url from 'url'



export function request(config: Partial<Http.Config>): Promise<any> {
	return Promise.resolve().then(function() {

		http.config(config)

		if (config.isProxy) {
			config.body = core.clone(config)
			config.method = 'POST'
			config.url = '/proxy'
		}

		if (config.url[0] == '/') {
			config.url = process.env.DOMAIN + '/api' + config.url
			_.defaults(config.headers, security.headers())
		}

		return config

	}).then(http.send).catch(function(error: boom) {
		let message = error.message
		let payload = _.get(error, 'output.payload') as boom.Payload
		if (payload) {
			message = JSON.stringify(payload.error == payload.message ? _.omit(payload, 'error') : payload)
		}
		let endpoint = `[${config.method}] ${config.url.replace(process.env.DOMAIN, '')}`
		console.log('%c◀ ' + endpoint, 'color: red; font-weight: bolder;', message)
		if (!payload || payload.statusCode != 401) {
			alert.snackbar({ message: endpoint + ' ➤ ' + message, type: 'is-danger' })
		}
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




