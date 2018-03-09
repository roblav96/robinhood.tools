// 

import * as _ from 'rambda'
import * as got from 'got'
import * as common from '@/common'



function request(config: HttpRequestConfig): Promise<any> {
	return Promise.resolve().then(function() {

		let pconfig = config.isproxy ? common.object.clone(config) : undefined
		// console.log('pconfig', JSON.stringify(pconfig, null, 4))

		if (!Number.isFinite(config.timeout)) config.timeout = 10000;
		if (!Number.isFinite(config.retries as any)) config.retries = 3;
		config.silent = config.silent == true || PRODUCTION
		if (!config.silent) console.log('%c▶ ' + config.method + ' ' + config.url + ' ▶', 'font-weight: 300;', (JSON.stringify(config.query || config.body || {})).substring(0, 64));

		if (config.url[0] == '/') config.url = DOMAIN + '/api' + config.url;

		if (!config.query) config.query = {};
		if (config.silent) config.query.silent = true;

		if (!config.headers) config.headers = {};
		Object.assign(config.headers, {
			'x-version': VERSION,
			'x-platform': 'web',
		})
		// Object.assign(config.headers, security.getHeaders())
		common.object.compact(config.headers)

		if (config.isproxy) {
			config.url = DOMAIN + '/api/proxy'
			config.body = pconfig
			config.method = 'POST'
		}

		console.log('config', JSON.stringify(config, null, 4))
		return got(config.url, config).then(function(response) {
			return Promise.resolve(response.body)
		})

	}).catch(function(error: got.GotError) {
		// console.log('http got > error', error)
		let message = error.message
		if (_.has('response.body.message', error)) message = error.response.body.message;
		let premessage = '[' + config.method + '] ' + config.url
		console.log('%c◀ ' + premessage + ' ◀', 'color: red; font-weight: bolder;', message)
		// Snackbar.push({ message: premessage + ' > ' + message, color: 'error' })
		return Promise.reject(error)
	})

}

export function get<T = any, Q = any>(url: string, query?: Q, config = {} as HttpRequestConfig): Promise<T> {
	config.url = url
	config.method = 'GET'
	if (query) config.query = query;
	return request(config)
}

export function post<T = any, B = any>(url: string, body?: B, config = {} as HttpRequestConfig): Promise<T> {
	config.url = url
	config.method = 'POST'
	if (body) config.body = body as any;
	return request(config)
}





// declare global {
interface HttpRequestConfig extends got.GotJSONOptions {
	url?: string
	query?: any
	silent?: boolean
	isproxy?: boolean
}
// }

