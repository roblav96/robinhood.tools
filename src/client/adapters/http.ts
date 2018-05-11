// 

export * from '@/common/http'
import * as boom from 'boom'
import * as http from '@/common/http'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as security from '@/client/adapters/security'
import url from 'url'
import vm from '@/client/vm'



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
		// console.info('error ->', error)
		// console.dir(error)
		// console.log('error ->', JSON.stringify(error, null, 4))
		// console.error('http error.message Error ->', error.message)
		// let message = _.get(error, 'statusMessage', error.message) as string
		// let payload = _.get(error, 'data')
		// if (payload && payload.message) {
		// 	let extra = payload.attributes ? JSON.stringify(payload.attributes) : payload.message
		// 	message += `: "${extra}"`
		// }
		let message = _.get(error, 'output.payload') ? JSON.stringify(error.output.payload) : error.message
		let endpoint = `[${config.method}] ${config.url.replace(process.env.DOMAIN, '')}`
		console.log('%c◀ ' + endpoint, 'color: red; font-weight: bolder;', message)
		vm.$toast.open({ message: endpoint + ' ➤ ' + message, type: 'is-danger' })

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




