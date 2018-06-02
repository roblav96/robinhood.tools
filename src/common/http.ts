// 

import * as _ from './lodash'
import * as core from './core'
import * as qs from 'querystring'
import * as fastjsonparse from 'fast-json-parse'
import * as proxify from 'proxify-url'
import * as simple from 'simple-get'
import * as boom from 'boom'
import clock from './clock'



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

export function config(config: Partial<Http.Config>) {

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



export function send(config: Http.Config) {
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
				let results = _.get(data, 'query.results')
				if (results != null) data = results;
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
			return clock.toPromise(config.retryTick).then(() => send(config))
		}
		return Promise.reject(error)
	})
}





declare module 'simple-get' { interface RequestOptions extends Partial<typeof HttpConfig> { } }
declare global { namespace Http { interface Config extends simple.RequestOptions { } } }


