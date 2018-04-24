// 

import * as _ from '../../common/lodash'
import * as qs from 'querystring'
import * as Polka from 'polka'
import * as boom from 'boom'
import * as turbo from 'turbo-http'
import * as jsonparse from 'fast-json-parse'



const server = turbo.createServer(function(req, res) {
	Object.assign(res, {
		send(this: any, data: any) {
			if (data.constructor == String || Buffer.isBuffer(data)) {
				this.setHeader('Content-Length', data.length)
				this.write(data)
			} if (data instanceof Object) {
				let json = JSON.stringify(data)
				this.setHeader('Content-Type', 'application/json')
				this.setHeader('Content-Length', json.length)
				this.write(json)
			} else {
				this.setHeader('Content-Length', 0)
				this.write('')
			}
		},
	})
})



const polka = Polka({
	server,
	onNoMatch: function(req, res) {
		polka.onError(boom.notFound(req.path), req, res)
	},
	onError(error, req, res, next) {
		if (!error.isBoom) error = new boom(error);
		if (error.data) {
			Object.assign(error.output.payload, { attributes: error.data })
		}
		res.statusCode = error.output.statusCode
		Object.keys(error.output.headers).forEach(function(key) {
			res.setHeader(key, error.output.headers[key])
		})
		res.send(error.output.payload)
	},
})



polka.use(function(req, res, next) {
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
						return next(parsed.err)
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


