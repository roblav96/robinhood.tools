// 

import * as _ from '../../common/lodash'
import * as onexit from 'exit-hook'
import * as TurboRequest from 'turbo-http/lib/request'
import * as TurboResponse from 'turbo-http/lib/response'
import * as turbo from 'turbo-http'
import * as Polka from 'polka'
import * as Boom from 'boom'
import * as FastestValidator from 'fastest-validator'
import server from './turbo'



{ (Polka as any).Router = Polka().constructor }
class Router<Server extends turbo.Server, Request extends TurboRequest & Polka.Request, Response extends TurboResponse> extends Polka.Router<Server, Request, Response> {

	hook(fn: (req: Request, res: Response) => Promise<void>) {
		this.use(function(req, res, next) {
			fn(req, res).then(function(resolved) {
				console.log('resolved ->', resolved)
				next(resolved as any)
			}).catch(function(error) {
				console.info('hook error ->', error)
				console.dir(error)
				next(error)
			})
		})
	}

	route(opts: {
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
				return polka.onError(Boom.unauthorized(), req, res, _.noop)
			}
			opts.handler(req, res).then(function(response) {
				if (response != null) res.send(response);
				if (!res.headerSent) res.end();
			}).catch(function(error) {
				polka.onError(error, req, res, _.noop)
			})
		})
	}

}



const polka = new Router({
	server: turbo.createServer(),

	onError(error, req, res, next) {
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
		polka.onError(Boom.notFound(null, { method: req.method, path: req.path }), req, res, _.noop)
	},

})

export default polka



setImmediate(async function start() {
	await polka.listen(+process.env.PORT, process.env.HOST)
	console.info('turbo listening ->', process.env.HOST + ':' + process.env.PORT)
})

onexit(function() {
	polka.server.connections.forEach(v => v.close())
	polka.server.close()
})


