// 

import * as _ from 'lodash'
import * as got from 'got'
import * as common from '@/common'
import * as router from '@/client/router'
import * as security from './security'



function request(config: Partial<HttpRequestConfig>): Promise<any> {
	return Promise.resolve().then(function() {

		config.json = true
		let pconfig = config.isproxy ? common.object.clone(config) : undefined
		// console.log('pconfig', JSON.stringify(pconfig, null, 4))

		if (!Number.isFinite(config.timeout)) config.timeout = 10000;
		if (!Number.isFinite(config.retries as any)) config.retries = 5;

		config.silent = config.silent || PRODUCTION
		if (!config.silent) console.log('%c▶ ' + config.method + ' ' + config.url + ' ▶', 'font-weight: 300;', (JSON.stringify(config.query || config.body || {})).substring(0, 64));

		if (config.url[0] == '/') config.url = process.env.DOMAIN + '/api' + config.url;

		if (!config.headers) config.headers = {};
		Object.assign(config.headers, {
			'x-version': process.env.VERSION,
			'x-platform': 'web',
			'x-silent': config.silent,
		})
		Object.assign(config.headers, security.getHeaders())
		common.object.compact(config.headers)

		if (config.isproxy) {
			config.url = process.env.DOMAIN + '/api/proxy'
			config.body = pconfig
			config.method = 'POST'
		}

		console.log('config', JSON.stringify(config, null, 4))
		return got(config.url, config as any).then(function(response) {
			// console.log('response.headers', JSON.stringify(response.headers, null, 4))
			return Promise.resolve(response.body)
		})

	}).catch(function(error: got.GotError) {
		// console.warn('http > error'); console.dir(error);
		let message = _.get(error, 'statusMessage', error.message)

		if (_.has(error, 'response.body.message') && error.response.body.message != message) {
			message += ': "' + error.response.body.message + '"'
			// let response = common.json.parse(error.response.body.message)
			// if (common.json.is(response)) response = common.json.parse(response);
			// console.log('response', response)
			// if (Array.isArray(response)) response = response[0];
			// message = message + ': ' + common.string.id(response.dataPath) + ' ' + response.message
			// message += ': "' + response + '"'
		}

		let route = '[' + _.get(error, 'method', config.method) + '] ' + _.get(error, 'url', config.url).replace(process.env.DOMAIN, '').trim()
		console.log('%c◀ ' + route, 'color: red; font-weight: bolder;', message)
		{ (router.app as any).$toast.open({ message: route + ' ▶ ' + message, type: 'is-danger' }) }

		error.message = message
		return Promise.reject(error)
	})

}

export function get<T = any, Q = any>(url: string, query?: Q, config = {} as Partial<HttpRequestConfig>): Promise<T> {
	config.url = url
	config.method = 'GET'
	if (query) config.query = query;
	return request(config)
}

export function post<T = any, B = any>(url: string, body?: B, config = {} as Partial<HttpRequestConfig>): Promise<T> {
	config.url = url
	config.method = 'POST'
	if (body) config.body = body as any;
	return request(config)
}





// declare global {
interface HttpRequestConfig extends got.GotJSONOptions {
	url: string
	query: any
	silent: boolean
	isproxy: boolean
}
// interface HttpHeaders {
// 	[header: string]: string
// }
// }

