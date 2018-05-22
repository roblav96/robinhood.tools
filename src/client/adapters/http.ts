// 

export * from '@/common/http'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import * as http from '@/common/http'
import * as security from '@/client/adapters/security'
import * as alert from '@/client/adapters/alert'
import * as proxify from 'proxify-url'
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
		if (error.isBoom && _.get(error, 'data.data.isBoom')) {
			Object.assign(error.output.payload, error.data.data)
		}

		let message = error.message
		let payload = _.get(error, 'output.payload') as boom.Payload
		if (payload) {
			message = payload.error
			if (message != payload.message) message += ` ➤ "${payload.message}"`;
		}

		let endpoint = `[${config.method}] ${config.url.replace(process.env.DOMAIN, '')}`
		console.log('%c◀ ' + endpoint, 'color: red; font-weight: bolder;', message)
		alert.toast({ message: endpoint + ' ➤ ' + message, type: 'is-danger' })

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





// let url = proxify('https://query1.finance.yahoo.com/v7/finance/quote?symbols=amd,nvda')
// console.log('url ->', url)
// http.get(url).then(function(response) {
// 	console.log(`response ->`, response)
// }).catch(function(error) {
// 	console.error(`created Error -> %O`, error)
// })


