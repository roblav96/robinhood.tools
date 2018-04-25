// 

import * as pandora from 'pandora'
import * as onexit from 'exit-hook'
import * as qs from 'querystring'
import * as Polka from 'polka'
import * as Boom from 'boom'
import * as http from 'http'
import * as turbo from 'turbo-http'
import * as jsonparse from 'fast-json-parse'



const polka = Polka({
	server: turbo.createServer(),

	onError(error, req, res, next) {
		if (res.headerSent) return next();
		if (!error.isBoom) error = new Boom(error);
		if (error.data) {
			Object.assign(error.output.payload, { attributes: error.data })
		}
		res.statusCode = error.output.statusCode
		Object.keys(error.output.headers).forEach(function(key) {
			res.setHeader(key, error.output.headers[key])
		})
		res.send(error.output.payload)
	},

	onNoMatch(req, res) {
		polka.onError(Boom.notFound(req.path), req, res)
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

	// req.headers = {} as any
	// req.rawHeaders = req._options.headers
	// let i: number, len = req.rawHeaders.length
	// for (i = 0; i < len; i += 2) {
	// 	req.headers[req.rawHeaders[i]] = req.rawHeaders[i + 1]
	// }

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
			next()
		},
	})

})

export default polka

setImmediate(function() {
	polka.listen(+process.env.PORT, process.env.HOST).then(function() {
		console.info('polka listening ->', process.env.HOST + ':' + process.env.PORT)
	}).catch(function(error) {
		console.error('polka listen Error ->', error)
	})
})

onexit(function() {
	polka.server.connections.forEach(v => v.close())
	polka.server.close()
})



