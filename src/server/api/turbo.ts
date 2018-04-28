// 

import * as _ from '../../common/lodash'
import * as qs from 'querystring'
import * as cookie from 'cookie'
import * as jsonparse from 'fast-json-parse'
import * as boom from 'boom'
import polka from './polka'



declare module 'turbo-http/lib/request' {
	interface TurboRequest {
		headers: { [header: string]: string }
		body: any
	}
}

declare module 'turbo-http/lib/response' {
	interface TurboResponse {
		finished: boolean
		setCookie(name: string, value: string, opts: cookie.CookieSerializeOptions): void
		writeHead(code: number, headers?: Dict<string>): void
		send(data: any): void
	}
}



polka.use(function(req, res, next) {

	req.socket.on('connect', function() { console.log('connection -> connect') })
	req.socket.on('finish', function() { console.log('connection -> finish') })
	req.socket.on('close', function() { console.log('connection -> close') })
	req.socket.on('end', function() { console.log('connection -> end') })
	req.socket.on('error', function() { console.log('connection -> error') })



	req.headers = {}
	let rawheaders = req._options.headers
	let i: number, len = rawheaders.length
	for (i = 0; i < len; i += 2) {
		req.headers[rawheaders[i].toLowerCase()] = rawheaders[i + 1]
	}

	Object.assign(req, {
		ondata(buffer, start, length) {
			if (!this.body) this.body = [];
			let chunk = buffer.slice(start, length + start)
			this.body.push(Buffer.from(chunk))
		},
		onend() {
			this.ondata = _.noop; this.onend = _.noop
			if (req.body) {
				req.body = Buffer.concat(req.body).toString()
				let content = req.getHeader('Content-Type')
				if (content == 'application/json') {
					let parsed = jsonparse(req.body)
					if (parsed.err) return next(boom.badData(parsed.err));
					req.body = parsed.value
				} else if (content == 'application/x-www-form-urlencoded') {
					req.body = qs.parse(req.body)
				}
			}
			next()
		},
	} as typeof req)



	Object.assign(res, {
		finished: false,
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
				this.setHeader('Content-Length', 0)
				this.write(Buffer.from(''))
				return
			}
			if (data.constructor == String || Buffer.isBuffer(data)) {
				if (data.constructor == String) data = Buffer.from(data);
				this.setHeader('Content-Length', data.length)
				this.write(data)
				return
			}
			if (data.constructor == Object || data instanceof Object) {
				// const circ = {} as any; circ.me = circ;
				// JSON.stringify(circ)
				data = Buffer.from(JSON.stringify(data))
				this.setHeader('Content-Type', 'application/json')
				this.setHeader('Content-Length', data.length)
				this.write(data)
				return
			}
			this.end(Buffer.isBuffer(data) ? data : Buffer.from(data))
		},
	} as typeof res)



})





// export default server




// this.ready = true
// this.





// declare module 'turbo-http/lib/request' {
// 	interface TurboRequest {
// 		// cookies: Dict<string>
// 		// headers: Dict<string>
// 		body: any
// 	}
// }

// polka.use(function(req, res, next) {

// 	Object.assign(req, {
// 		ondata(buffer, start, length) {
// 			if (!this.body) this.body = [];
// 			this.body.push(Buffer.from(buffer.slice(start, length + start)))
// 			// console.log('this.body.length ->', this.body.length)
// 		},
// 		onend() {
// 			if (this.body) {
// 				this.body = Buffer.concat(this.body).toString()
// 				let content = this.getHeader('Content-Type')
// 				if (content == 'application/json') {
// 					let parsed = jsonparse(this.body)
// 					if (parsed.err) {
// 						next(parsed.err)
// 						return
// 					}
// 					this.body = parsed.value
// 				} else if (content == 'application/x-www-form-urlencoded') {
// 					this.body = qs.parse(this.body)
// 				}
// 			}
// 			Object.assign(this, { ondata: _.noop, onend: _.noop })
// 			next()
// 		},
// 	} as typeof req)

// })



// declare module 'turbo-http/lib/response' {
// 	interface TurboResponse {
// 		writeHead(code?: number, headers?: Dict<string>): void
// 		setCookie(name: string, value: string, opts: cookie.CookieSerializeOptions): void
// 		send(data?: any): void
// 	}
// }

// polka.use(function(req, res, next) {



// 	next()

// })



// // let map = new Map()
// // map.set()
// // let wmap = new WeakMap()
// // wmap.set()
// // console.log('wmap ->', wmap)

// // class Assign {
// // 	headers = {} as Dict<string>
// // 	setHeader_: typeof TurboResponse.prototype.setHeader
// // 	setHeader(name, value) {
// // 		this.headers[name] = value
// // 		return this.setHeader_(name, value)
// // 	}
// // }
// // declare module 'turbo-http/lib/response' {
// // 	// type IAssign = typeof Assign
// // 	interface TurboResponse extends Assign { }
// // }



// // Object.assign(TurboResponse.prototype, {
// // 	headers: {},
// // 	_setHeader: TurboResponse.prototype.setHeader,
// // 	setHeader(name, value) {
// // 		this.headers[name] = value
// // 		return this._setHeader(name, value)
// // 	},
// // } as TurboResponse)
// // console.info('TurboResponse ->', TurboResponse)
// // console.dir(TurboResponse)

// // polka.use(function(req, res, next) {
// // 	console.log('req ->', req)
// // 	console.log('req.awesome ->', req.awesome)
// // 	req.awesome()
// // 	next()
// // })


