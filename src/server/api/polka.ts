// 

import * as _ from '../../common/lodash'
import * as Polka from 'polka'
import * as boom from 'boom'
import * as FastestValidator from 'fastest-validator'
import * as turbo from './turbo'



{ (Polka as any).Router = Polka().constructor }
class Router<Server extends typeof turbo.server = typeof turbo.server, Request extends (turbo.NitroRequest & Polka.Request) = (turbo.NitroRequest & Polka.Request), Response extends turbo.NitroResponse = turbo.NitroResponse> extends Polka.Router<Server, Request, Response> {

	route(opts: {
		method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'
		url: string
		authed?: boolean
		schema?: { query: any, body: any }
		handler: (req: Request, res: Response) => Promise<void>
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
					if (req[key] == null) return next(boom.preconditionRequired(key));
					let invalid = validate[key](req[key])
					if (Array.isArray(invalid)) {
						let error = boom.preconditionFailed(key)
						error.data = invalid as any
						return next(error)
					}
				}
				next()
			})
		}
		this[opts.method.toLowerCase()](opts.url, function(req: Request, res: Response) {
			if (opts.authed && !req.authed) {
				return polka.onError(boom.unauthorized(), req, res, _.noop)
			}
			opts.handler(req, res).then(function(response) {
				if (response != null) res.send(response);
				if (!res.headerSent) res.end();
			}).catch(function(error) {
				polka.onError(error, req, res, _.noop)
			})
		})
	}

	// hook(fn: Polka.Handler<Request, Response>) {
	// 	this.use(function hook(req, res, next) {
	// 		fn(req, res, next)
	// 	})
	// }
	// puse(fn: (req: Request, res: Response) => Promise<void>) {
	// 	this.use(function puse(req, res, next) {
	// 		fn(req, res).then(next as any).catch(next)
	// 	})
	// }

}



const polka = new Router({

	onError(error: boom, req, res, next) {
		if (!error.isBoom) {
			console.error('polka onError ->', error)
			error = new boom(error)
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
		if (res.headerSent) return;
		polka.onError(boom.notFound(null, { method: req.method, path: req.path }), req, res, _.noop)
	},

})

turbo.server.on('request', polka.handler as any)

export default polka





polka.get('/api/hello', function get(req, res) {
	// res.end()
	res.end(JSON.stringify({ hello: 'world' }))
	// res.send({ hello: 'world' })
})


