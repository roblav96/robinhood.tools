// 

export * from '../../common/http'
import * as url from 'url'
import * as qs from 'querystring'
import * as simple from 'simple-get'
import * as http from '../../common/http'



export function request(config: Partial<Http.Config>): Promise<any> {
	return Promise.resolve().then(function() {

		http.config(config)

		if (config.isProxy) return config;

		let { host } = url.parse(config.url)
		// if (config.hHost) config.headers['Host'] = host;
		// if (config.hOrigin) config.headers['Origin'] = `${protocol}//${host}`;
		// if (config.hReferer) config.headers['Referer'] = `${protocol}//${host}`;

		if (host.includes('robinhood.com')) {
			config.headers['x-robinhood-api-version'] = '1.212.3'
			config.headers['origin'] = 'https://robinhood.com'
			config.headers['referer'] = 'https://robinhood.com/'
			if (config.rhtoken) {
				config.headers['authorization'] = `Bearer ${config.rhtoken}`
			}
		}

		if (host.includes('webull.com') || host.includes('stocks666.com')) {
			Object.assign(config.headers, {
				'cache-control': 'no-cache',
				pragma: 'no-cache',
				origin: 'https://app.webull.com',
				referer: 'https://app.webull.com',
				ver: '1.8.4',
				app: 'desktop',
				os: 'web',
				osv: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)',
				dnt: '1', hl: 'en', locale: 'eng', tz: 'America/New_York',
			})
			config.headers['user-agent'] = config.headers['osv']
			if (config.wbauth) {
				if (process.env.WEBULL_DID) config.headers['did'] = process.env.WEBULL_DID;
				if (process.env.WEBULL_TOKEN) config.headers['access_token'] = process.env.WEBULL_TOKEN;
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




