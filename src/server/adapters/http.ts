// 
export * from '../../common/http'
// 

import * as _ from '../../common/lodash'
import * as url from 'url'
import * as qs from 'querystring'
import * as simple from 'simple-get'
import * as got from 'got'
import * as http from '../../common/http'



export function request(config: Partial<Http.Config>): Promise<any> {
	return Promise.resolve().then(function() {

		http.config(config)

		let parsed = url.parse(config.url)
		if (config.hHost) config.headers['Host'] = parsed.host;
		if (config.hOrigin) config.headers['Origin'] = `${parsed.protocol}//${parsed.host}`;
		if (config.hReferer) config.headers['Referer'] = `${parsed.protocol}//${parsed.host}`;

		if (config.isProxy) return config;

		if (parsed.host.includes('robinhood.com')) {
			if (config.robinhoodToken) {
				config.headers['Authorization'] = 'Bearer ' + config.robinhoodToken
			}
		}

		if (parsed.host.includes('webull.com') || parsed.host.includes('stocks666.com')) {
			Object.assign(config.headers, {
				pragma: 'no-cache',
				origin: 'https://app.webull.com',
				referer: 'https://app.webull.com',
				ver: '1.8.4',
				app: 'desktop',
				os: 'web',
				osv: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)',
				dnt: '1', hl: 'en', locale: 'eng', tz: 'America/New_York',
			})
			config.headers['User-Agent'] = config.headers['osv']
			if (config.webullAuth) {
				config.headers['did'] = process.env.WEBULL_DID
				config.headers['access_token'] = process.env.WEBULL_TOKEN
			}
		}

		return config

	}).then(http.send)

}



export function get<T = any>(url: string, config = {} as Partial<Http.Config>): Promise<T> {
	config.url = url
	config.method = 'GET'
	return request(config)
}

export function post<B = any, T = any>(url: string, body?: B, config = {} as Partial<Http.Config>): Promise<T> {
	config.url = url
	config.method = 'POST'
	if (body) config.body = body;
	return request(config)
}




