// 
export * from '../../common/http'
// 

import * as _ from 'lodash'
import * as url from 'url'
import * as boom from 'boom'
import * as got from 'got'
import * as http from '../../common/http'



export function request(config: Partial<Http.RequestConfig>): Promise<any> {
	return Promise.resolve().then(function() {

		let parsed = url.parse(config.url)
		_.defaults(config, {
			json: true,
			timeout: http.timeout,
			retries: http.retries,
			headers: {
				'Accept-Encoding': 'deflate, gzip',
				'Host': parsed.host,
			},
		} as Partial<Http.RequestConfig>)

		if (config.isProxy) return config;

		if (parsed.host.includes('robinhood.com')) {
			if (config.rhAuthToken) {
				config.headers['Authorization'] = 'Bearer ' + config.rhAuthToken
			}
		}

		if (parsed.host.includes('webull.com') || parsed.host.includes('stocks666.com')) {
			Object.assign(config.headers, {
				dnt: '1', hl: 'en', locale: 'eng', tz: 'America/New_York',
				ver: '1.8.4',
				app: 'desktop',
				os: 'web',
				osv: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)',
			})
			if (config.wbAuthToken) {
				config.headers['did'] = process.env.WEBULL_DID
				config.headers['access_token'] = process.env.WEBULL_TOKEN
			}
		}
		
		console.log('config ->', config)

		return config

	}).then(function(config: Http.RequestConfig) {
		return got(config.url, config).then(({ body }) => body)
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




