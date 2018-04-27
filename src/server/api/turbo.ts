// 

import * as _ from '../../common/lodash'
import * as util from 'util'
import * as qs from 'querystring'
import * as cookie from 'cookie'
import * as jsonparse from 'fast-json-parse'
import * as TurboRequest from 'turbo-http/lib/request'
import * as TurboResponse from 'turbo-http/lib/response'
import * as turbo from 'turbo-http'
import polka from './polka'



declare module 'turbo-http/lib/request' {
	interface TurboRequest {
		cookies: Dict<string>
		headers: Dict<string>
		body: any
	}
}

declare module 'turbo-http/lib/response' {
	interface TurboResponse {
		headers: Dict<string>
		_setHeader: typeof TurboResponse.prototype.setHeader
		writeHead(code?: number, headers?: Dict<string>): void
		setCookie(name: string, value: string, opts: cookie.CookieSerializeOptions): void
		send(data?: any): void
	}
}



Object.assign(TurboResponse.prototype, {
	headers: {},
	_setHeader: TurboResponse.prototype.setHeader,
	setHeader(name, value) {
		this.headers[name] = value
		return this._setHeader(name, value)
	},
} as TurboResponse)
// console.info('TurboResponse ->', TurboResponse)
// console.dir(TurboResponse)



polka.use(function(req, res, next) {

	req.headers = {}
	let i: number, len = req._options.headers.length
	for (i = 0; i < len; i += 2) {
		req.headers[req._options.headers[i].toLowerCase()] = req._options.headers[i + 1]
	}

	Object.assign(req, {
		ondata(buffer, start, length) {
			if (!this.body) this.body = [];
			this.body.push(Buffer.from(buffer.slice(start, length + start)))
		},
		onend() {
			if (this.body) {
				this.body = Buffer.concat(this.body).toString()
				let type = req.getHeader('Content-Type')
				if (type == 'application/json') {
					let parsed = jsonparse(req.body)
					if (parsed.err) {
						next(parsed.err)
						return
					}
					req.body = parsed.value
				} else if (type == 'application/x-www-form-urlencoded') {
					req.body = qs.parse(req.body)
				}
			}
			Object.assign(this, { ondata: _.noop, onend: _.noop })
			console.log('this ->', this)
			next()
		},
	} as typeof req)

	Object.assign(res, {
		setCookie(name, value, opts = {}) {
			if (Number.isFinite(opts.expires as any)) {
				opts.expires = new Date(opts.expires)
			}
			this.setHeader('Set-Cookie', cookie.serialize(name, value, opts))
		},
		writeHead(code, headers = {}) {
			if (Number.isFinite(code)) this.statusCode = code;
			Object.keys(headers).forEach(key => {
				this.setHeader(key, headers[key])
			})
		},
		send(data) {
			if (data == null) {
				this.setHeader('Content-Length', '0')
				this.write('')
				return
			}
			if (data.constructor == String || Buffer.isBuffer(data)) {
				this.setHeader('Content-Length', data.length.toString())
				this.write(data)
				return
			}
			if (data.constructor == Object || data instanceof Object) {
				const circ = {} as any; circ.me = circ;
				JSON.stringify(circ)

				let json = JSON.stringify(data)
				this.setHeader('Content-Type', 'application/json')
				this.setHeader('Content-Length', json.length.toString())
				this.write(json)
				return
			}
			this.write(data)
		},
	} as typeof res)

})

// polka.use(function(req, res, next) {
// 	console.log('req ->', req)
// 	console.log('req.awesome ->', req.awesome)
// 	req.awesome()
// 	next()
// })


