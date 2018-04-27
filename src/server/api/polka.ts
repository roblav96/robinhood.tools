// 

import * as _ from '../../common/lodash'
import * as onexit from 'exit-hook'
import * as qs from 'querystring'
import * as Polka from 'polka'
import * as Boom from 'boom'
import * as net from 'turbo-net'
import * as turbo from 'turbo-http'
import * as jsonparse from 'fast-json-parse'
import * as FastestValidator from 'fastest-validator'



let socket = net.createServer()
socket.on('')
socket.on('', function() { })
socket.on('listening', function(sdw) { })
socket.on('connection', function(socket) { })
socket.on('error', function(error) { })

// console.log('turbo ->', turbo)
// console.warn('turbo ->', console.dtsgen(turbo))

const server = turbo.createServer(function(req, res) {
	console.log('req ->', req)
	console.log('res ->', res)
})
server.address
server.on('')
server.on('', function() {

})
server.on('connection', function(socket) {

})

// console.log('server ->', server)
// console.warn('server ->', console.dtsgen(server))





const polka = Polka({
	server,

	onError(error: Boom, req, res, next) {
		if (!error.isBoom) {
			console.error('polka Error ->', error)
			error = new Boom(error)
		} else {
			if (error.data) Object.assign(error.output.payload, { attributes: error.data });
			console.warn('polka onError ->', error.output.payload) // error.output.payload.error, error.message, error.output.payload)
		}
		if (res.headerSent) return;
		res.statusCode = error.output.statusCode
		Object.keys(error.output.headers).forEach(function(key) {
			res.setHeader(key, error.output.headers[key])
		})
		res.send(error.output.payload)
	},

	onNoMatch(req, res) {
		polka.onError(Boom.notFound(void 0, { method: req.method, path: req.path }), req, res)
	},

})

Object.assign(polka, {

	hook(this: any, handler: (req, res) => Promise<void>) {
		this.use(function(req, res, next) {
			handler(req, res).then(next).catch(next)
		})
	},

	route(this: any, opts: {
		method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'
		url: string
		authed?: boolean
		schema?: {
			query: any
			body: any
		}
		handler: (req, res) => Promise<void>
	}) {
		if (opts.schema) {
			const validate = {} as any
			Object.keys(opts.schema).forEach(function(key) {
				validate[key] = new FastestValidator().compile(opts.schema[key])
			})
			this.use(opts.url, function(req, res, next) {
				let keys = Object.keys(validate)
				let i: number, len = keys.length
				for (i = 0; i < len; i++) {
					let key = keys[i]
					if (req[key] == null) return next(Boom.preconditionRequired(key));
					let invalid = validate[key](req[key])
					if (Array.isArray(invalid)) {
						let error = Boom.preconditionFailed(key)
						error.data = invalid as any
						return next(error)
					}
				}
				next()
			})
		}
		this[opts.method.toLowerCase()](opts.url, function(req, res) {
			if (opts.authed && !req.authed) {
				return polka.onError(Boom.unauthorized(), req, res)
			}
			opts.handler(req, res).then(function(response) {
				if (response != null) res.send(response);
				if (!res.headerSent) res.end();
			}).catch(function(error) {
				polka.onError(error, req, res)
			})
		})
	},

})

polka.use(function(req, res, next) {

	Object.assign(res, {
		writeHead(this: any, code, headers = {}) {
			if (Number.isFinite(code)) this.statusCode = code;
			Object.keys(headers).forEach(key => {
				this.setHeader(key, headers[key])
			})
		},
		send(this: any, data) {
			if (data == null) {
				this.setHeader('Content-Length', 0)
				this.write('')
				return
			}
			if (data.constructor == String || Buffer.isBuffer(data)) {
				this.setHeader('Content-Length', data.length)
				this.write(data)
				return
			}
			if (data.constructor == Object || data instanceof Object) {
				let json = JSON.stringify(data)
				this.setHeader('Content-Type', 'application/json')
				this.setHeader('Content-Length', json.length)
				this.write(json)
				return
			}
			this.write(data)
		},
	})

	req.headers = {} as any
	let i: number, len = req._options.headers.length
	for (i = 0; i < len; i += 2) {
		req.headers[req._options.headers[i].toLowerCase()] = req._options.headers[i + 1]
	}

	Object.assign(req, {
		ondata(this: any, buffer, start, length) {
			if (!this.body) this.body = [];
			this.body.push(Buffer.from(buffer.slice(start, length + start)))
		},
		onend(this: any) {
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
			next()
		},
	})

})

export default polka

setImmediate(async function() {
	await polka.listen(+process.env.PORT, process.env.HOST)
	console.info('polka listening ->', process.env.HOST + ':' + process.env.PORT)
})

onexit(function() {
	polka.server.connections.forEach(v => v.close())
	polka.server.close()
})


