// 

import * as _ from '../../common/lodash'
import * as onexit from 'exit-hook'
import * as qs from 'querystring'
import * as Polka from 'polka'
import * as Boom from 'boom'
import * as http from 'http'
import * as turbo from 'turbo-http'
import * as jsonparse from 'fast-json-parse'
import * as FastestValidator from 'fastest-validator'



const polka = new Polka.Polka({
	server: turbo.createServer(),

	onError(error: Boom, req, res, next) {
		// if (res.headerSent) return next();
		if (!error.isBoom) {
			console.error('polka Error ->', error)
			error = new Boom(error)
		} else {
			console.error('polka Error ->', error.name, error.message, error.output)
		}
		res.statusCode = error.output.statusCode
		Object.keys(error.output.headers).forEach(function(key) {
			res.setHeader(key, error.output.headers[key])
		})
		if (error.data) Object.assign(error.output.payload, { attributes: error.data });
		res.send(error.output.payload)
	},

	onNoMatch(req, res) {
		polka.onError(Boom.notFound(req.path), req, res)
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
		this[opts.method.toLowerCase()](opts.url, function(req, res, next) {
			opts.handler(req, res).then(next).catch(next)
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


