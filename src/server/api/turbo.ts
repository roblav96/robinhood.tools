// 

import * as _ from '../../common/lodash'
import * as util from 'util'
import * as TurboRequest from 'turbo-http/lib/request'
import * as TurboResponse from 'turbo-http/lib/response'
import * as qs from 'querystring'
import * as cookie from 'cookie'
import * as jsonparse from 'fast-json-parse'
import * as boom from 'boom'
import polka from './polka'



export interface PolkaRequest extends TurboRequest { }
export class PolkaRequest {
	body: any
	authed: boolean
	headers: Dict<string>
	cookies: Dict<string>
}
util.inherits(TurboRequest, PolkaRequest)



export interface PolkaResponse extends TurboResponse { }
export class PolkaResponse {
	setCookie(name, value, opts = {} as cookie.CookieSerializeOptions) {
		if (Number.isFinite(opts.expires as any)) {
			opts.expires = new Date(opts.expires)
		}
		this.setHeader('set-cookie', cookie.serialize(name, value, opts))
	}
	writeHead(code: number, headers: Dict<string>) {
		this.statusCode = code;
		Object.keys(headers).forEach(key => {
			this.setHeader(key, headers[key])
		})
	}
	send(data?: any) {
		data = data || ''
		if (typeof data == 'object' && data.constructor == Object) {
			data = JSON.stringify(data)
			this.setHeader('content-type', 'application/json')
		}
		this.end(data)
		// if (typeof data == 'string') data = Buffer.from(data);
		// this.setHeader('content-length', data.length)
		// this.write(data)
	}
}
util.inherits(TurboResponse, PolkaResponse)



polka.use(function(req, res, next) {

	req.headers = {}
	let rawheaders = req._options.headers
	let i: number, len = rawheaders.length
	for (i = 0; i < len; i += 2) {
		let header = rawheaders[i].toLowerCase()
		req.headers[header] = rawheaders[i + 1]
	}
	let cookies = req.headers['cookie']
	if (cookies) req.cookies = cookie.parse(cookies);

	let chunks = [] as string[]
	req.ondata = function ondata(buffer, start, length) {
		let chunk = buffer.slice(start, length + start)
		chunks.push(chunk.toString())
	}
	req.onend = function onend() {
		req.ondata = _.noop; req.onend = _.noop
		let body = chunks.join('')
		if (!body) return next();
		let content = req.headers['content-type']
		if (content == 'application/json') {
			let parsed = jsonparse(body)
			if (parsed.err) return next(boom.badData(parsed.err));
			req.body = parsed.value
		} else if (content == 'application/x-www-form-urlencoded') {
			req.body = qs.parse(body)
		} else {
			req.body = body
		}
		next()
	}

})

// declare module 'turbo-http' {
// 	namespace Server {
// 		interface Events {
// 			'next': void[]
// 		}
// 	}
// }

// export const server = turbo.createServer(function handler(req, res) {
// 	// console.log('req ->', req)
// 	// console.log('req.__proto__ ->', req.__proto__)
// 	// console.info('TurboRequest ->', TurboRequest)
// 	// console.dir(TurboRequest)

// 	req.socket.on('connect', function() { console.log('connection -> connect') })
// 	req.socket.on('finish', function() { console.log('connection -> finish') })
// 	req.socket.on('end', function() { console.log('connection -> end') })
// 	req.socket.on('close', function() { console.log('connection -> close') })
// 	req.socket.on('error', function(error) { console.log('connection Error ->', error) })

// 	let rawheaders = this._options.headers
// 	let i: number, len = rawheaders.length
// 	for (i = 0; i < len; i += 2) {
// 		this.headers[rawheaders[i].toLowerCase()] = rawheaders[i + 1]
// 	}
// 	let cookies = this.getHeader('cookie')
// 	if (cookies) this.cookies = cookie.parse(cookies);

// })

// setImmediate(function listen() {
// 	server.listen(+process.env.IPORT, process.env.HOST, function onlisten() {
// 		console.info('turbo listening ->', process.env.HOST + ':' + process.env.IPORT)
// 	})
// })

// onexit(function() {
// 	server.connections.forEach(v => v.close())
// 	server.close()
// })





// polka.use(function(req, res, next) {

// 	console.log('req ->', req)
// 	console.log('req.build ->', req.build)

// 	req.socket.on('connect', function() { console.log('connection -> connect') })
// 	req.socket.on('finish', function() { console.log('connection -> finish') })
// 	req.socket.on('end', function() { console.log('connection -> end') })
// 	req.socket.on('close', function() { console.log('connection -> close') })
// 	req.socket.on('error', function(error) { console.log('connection Error ->', error) })

// 	// Object.assign(req, new Request())
// 	// util.inherits(req.constructor, Request)
// 	// req.build()

// 	// Object.assign(res, new Response())
// 	// util.inherits(res.constructor, Response)

// 	Object.assign(req, {
// 		ondata(buffer, start, length) {
// 			if (!this.body) this.body = [];
// 			let chunk = buffer.slice(start, length + start)
// 			this.body.push(Buffer.from(chunk))
// 		},
// 		onend() {
// 			this.ondata = _.noop; this.onend = _.noop
// 			if (req.body) {
// 				req.body = Buffer.concat(req.body).toString()
// 				let content = req.getHeader('content-type')
// 				if (content == 'application/json') {
// 					let parsed = jsonparse(req.body)
// 					if (parsed.err) return next(boom.badData(parsed.err));
// 					req.body = parsed.value
// 				} else if (content == 'application/x-www-form-urlencoded') {
// 					req.body = qs.parse(req.body)
// 				}
// 			}
// 			next()
// 		},
// 	} as typeof req)

// })





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


