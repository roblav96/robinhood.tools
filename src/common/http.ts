// 

import * as _ from './lodash'
import * as core from './core'
import * as qs from 'querystring'
import * as fastjsonparse from 'fast-json-parse'
import * as proxify from 'proxify-url'
import * as simple from 'simple-get'
import * as boom from 'boom'
import * as url from 'url'
import clock from './clock'



export function request(config = {} as Partial<Http.Config>) {
	return Promise.resolve().then(function() {

		applyconfig(config)

		if (process.env.CLIENT) {
			if (config.url[0] == '/') {
				let protocol = process.env.DEVELOPMENT ? 'http://' : 'https://'
				config.url = protocol + process.env.DOMAIN + '/api' + config.url
				global.cookies()
			}
		}

		if (process.env.SERVER) {
			let host = url.parse(config.url).host
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
					host,
					origin: 'https://app.webull.com',
					referer: 'https://app.webull.com',
					ver: '1.8.4',
					app: 'desktop',
					os: 'web',
					osv: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)',
					dnt: '1', hl: 'en', locale: 'eng', tz: 'America/New_York',
					pragma: 'no-cache',
					'cache-control': 'no-cache',
				})
				config.headers['user-agent'] = config.headers['osv']
				if (config.wbauth) {
					if (process.env.WEBULL_DID) config.headers['did'] = process.env.WEBULL_DID;
					if (process.env.WEBULL_TOKEN) config.headers['access_token'] = process.env.WEBULL_TOKEN;
				}
			}
		}

		return config

	}).then(send).catch(function(error: boom) {

		if (process.env.SERVER) {
			return Promise.reject(error)
		}

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
		// alert.toast({ message: endpoint + ' ➤ ' + message, type: 'is-danger' })

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
	if (body) config.body = body;
	return request(config)
}



const HttpConfig = {
	headers: {},
	verbose: false,
	silent: false,
	debug: false,
	proxify: false,
	timeout: 10000,
	retries: process.env.CLIENT ? 0 : 3,
	retryTick: '3s' as Clock.Tick,
	maxRedirects: 10,
	rhtoken: '',
	wbauth: false,
	query: undefined as any,
}
Object.keys(HttpConfig).forEach(k => { if (!HttpConfig[k]) delete HttpConfig[k]; })

export function applyconfig(config: Partial<Http.Config>) {

	core.object.repair(config, core.clone(HttpConfig))

	if (process.env.CLIENT && config.retries == Infinity) config.retryTick = '1s';

	if (config.verbose || config.debug) {
		let ending = (config.query || config.body) ? ' -> ' + (JSON.stringify(config.query || config.body || '')).substring(0, 64) : ''
		console.log('-> ' + config.method + ' ' + config.url + ending);
	}

	if (config.query) {
		config.url += `?${qs.stringify(config.query)}`
		delete config.query
	}

	if (config.proxify) {
		config.url = proxify(config.url)
	}

	if (config.body) {
		config.headers['accept'] = 'application/json'
		config.headers['content-type'] = 'application/json'
		config.body = JSON.stringify(config.body)
	}

	return config
}



function send(config: Http.Config) {
	if (config.debug) console.log('config ->', config);
	return new Promise(function(resolve, reject) {
		simple.concat(config, function(error, res, data: any) {
			if (error && !res) return reject(error);
			if (data) {
				data = data.toString()
				let type = res.headers['content-type']
				if (type && type.includes('application/json')) {
					let parsed = fastjsonparse(data)
					if (parsed.err) {
						return reject(new boom(parsed.err, {
							statusCode: 422,
							message: parsed.err.message,
							data: { data, config: _.pick(config, ['method', 'url']) },
						}))
					}
					data = parsed.value
				}
			}
			// console.log('error ->', JSON.stringify(error, null, 4))
			// console.info('error ->', error)
			// console.dir(error)
			// console.log('res ->', res)
			// console.log('data ->', data)
			if (error || res.statusCode >= 400) {
				// console.log('error ->', error)
				return reject(new boom(error || res.statusMessage, {
					statusCode: res.statusCode,
					message: error ? error.message : res.statusMessage,
					data: { data, config: _.pick(config, ['method', 'url']) },
				}))
			}

			if (config.proxify) {
				data = _.get(data, 'query.results')
				// let results = _.get(data, 'query.results')
				// if (results != null) data = results;
			}

			if (config.verbose || config.debug) {
				let ending = (config.query || config.body) ? ' <- ' + (JSON.stringify(config.query || config.body || '')).substring(0, 64) : ''
				console.info('<- ' + config.method + ' ' + config.url + ending);
			}

			resolve(data)
		})
	}).catch(function(error) {
		let reject = boom.isBoom(error) && [401, 500].includes(error.output.statusCode)
		if (!reject && config.retries > 0) {
			config.retries--
			if (!config.silent && process.env.DEVELOPMENT && process.env.SERVER) {
				console.warn('retry Error ->', config, error)
			}
			global.cookies()
			return clock.toPromise(config.retryTick).then(() => send(config))
		}
		return Promise.reject(error)
	})
}





declare module 'simple-get' { interface RequestOptions extends Partial<typeof HttpConfig> { } }
declare global {
	namespace NodeJS { interface Global { cookies(): void } }
	namespace Http { interface Config extends simple.RequestOptions { } }
}


