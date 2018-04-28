// 

import * as _ from '../../common/lodash'
import * as qs from 'querystring'
import * as cookie from 'cookie'
import * as jsonparse from 'fast-json-parse'
import * as TurboRequest from 'turbo-http/lib/request'
import * as TurboResponse from 'turbo-http/lib/response'
import * as turbo from 'turbo-http'
import polka from './polka'



declare module 'turbo-net' {
	namespace Connection {
		interface Events {
			'next': void[]
		}
	}
}
declare module 'turbo-http/lib/request' {
	interface TurboRequest {
		next: boolean
		body: any
	}
}
declare module 'turbo-http/lib/response' {
	interface TurboResponse {
		writeHead(code?: number, headers?: Dict<string>): void
		send(data?: any): void
	}
}

polka.use(function(req, res, next) {
	if (req.next) next();
	else req.socket.once('next', next);

	Object.assign(req, {
		ondata(buffer, start, length) {
			console.log('ondata')
			if (!this.body) this.body = [];
			this.body.push(Buffer.from(buffer.slice(start, length + start)))
		},
		onend() {
			console.timeEnd('onend')
			this.onnext = true
			Object.assign(this, { ondata: _.noop, onend: _.noop })
			this.socket.emit('onnext')
			// console.log('req.onnext ->', req.onnext)
		},
	} as typeof req)

})







// export default server



// if (this.body) {
// 	this.body = Buffer.concat(this.body).toString()
// 	let content = this.getHeader('Content-Type')
// 	if (content == 'application/json') {
// 		let parsed = jsonparse(this.body)
// 		if (parsed.err) {
// 			this.ready = true
// 			this.socket.emit('ready', parsed.err)
// 			// next(parsed.err)
// 			return
// 		}
// 		this.body = parsed.value
// 	} else if (content == 'application/x-www-form-urlencoded') {
// 		this.body = qs.parse(this.body)
// 	}
// }
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

// 	// req.headers = {}
// 	// let i: number, len = req._options.headers.length
// 	// for (i = 0; i < len; i += 2) {
// 	// 	req.headers[req._options.headers[i].toLowerCase()] = req._options.headers[i + 1]
// 	// }

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

// 	Object.assign(res, {
// 		setCookie(name, value, opts = {}) {
// 			if (Number.isFinite(opts.expires as any)) {
// 				opts.expires = new Date(opts.expires)
// 			}
// 			this.setHeader('Set-Cookie', cookie.serialize(name, value, opts))
// 		},
// 		writeHead(code, headers = {}) {
// 			if (Number.isFinite(code)) this.statusCode = code;
// 			Object.keys(headers).forEach(key => {
// 				this.setHeader(key, headers[key])
// 			})
// 		},
// 		send(data) {
// 			if (data == null) {
// 				this.setHeader('Content-Length', '0')
// 				this.write('')
// 				return
// 			}
// 			if (data.constructor == String || Buffer.isBuffer(data)) {
// 				this.setHeader('Content-Length', data.length.toString())
// 				this.write(data)
// 				return
// 			}
// 			if (data.constructor == Object || data instanceof Object) {
// 				const circ = {} as any; circ.me = circ;
// 				JSON.stringify(circ)

// 				let json = JSON.stringify(data)
// 				this.setHeader('Content-Type', 'application/json')
// 				this.setHeader('Content-Length', json.length.toString())
// 				this.write(json)
// 				return
// 			}
// 			this.write(data)
// 		},
// 	} as typeof res)

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


