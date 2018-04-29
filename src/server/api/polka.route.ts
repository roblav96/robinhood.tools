// 

import { Server as PolkaServer } from 'turbo-http'
import PolkaRequest from './polka.request'
import PolkaResponse from './polka.response'
import * as _ from '../../common/lodash'
import * as util from 'util'
import * as Polka from 'polka'
import * as boom from 'boom'
import * as FastestValidator from 'fastest-validator'
import polka from './polka'



console.warn('FastestValidator ->', console.dtsgen(FastestValidator))

let validator = new FastestValidator()
console.log('validator ->', validator)
console.warn('validator ->', console.dtsgen(validator))

let schema = {}
let check = validator.compile(schema)
console.warn('check ->', console.dtsgen(check))

let result = check({ hai: 'world' })
result
console.warn('result ->', console.dtsgen(result))



// export default interface Router extends Polka.Router<PolkaServer, PolkaRequest, PolkaResponse> { }
export default class Route {

	constructor(
		public opts: {
			method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'
			url: string
			authed?: boolean
			schema?: { query: any, body: any }
		},
		public handler: (req: PolkaRequest, res: PolkaResponse) => Promise<void>
	) {

	}

}



// const route = {
// 	route(opts: {
// 		method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'
// 		url: string
// 		authed?: boolean
// 		schema?: { query: any, body: any }
// 		handler: (req: Request, res: Response) => Promise<void>
// 	}) {
// 		if (opts.schema) {
// 			const validate = {} as any
// 			Object.keys(opts.schema).forEach(function(key) {
// 				validate[key] = new FastestValidator().compile(opts.schema[key])
// 			})
// 			this.use(opts.url, function(req, res, next) {
// 				let keys = Object.keys(validate)
// 				let i: number, len = keys.length
// 				for (i = 0; i < len; i++) {
// 					let key = keys[i]
// 					if (req[key] == null) return next(boom.preconditionRequired(key));
// 					let invalid = validate[key](req[key])
// 					if (Array.isArray(invalid)) {
// 						let error = boom.preconditionFailed(key)
// 						error.data = invalid as any
// 						return next(error)
// 					}
// 				}
// 				next()
// 			})
// 		}
// 		this[opts.method.toLowerCase()](opts.url, function(req: Request, res: Response) {
// 			if (opts.authed && !req.authed) {
// 				return polka.onError(boom.unauthorized(), req, res, _.noop)
// 			}
// 			opts.handler(req, res).then(function(response) {
// 				if (response != null) res.send(response);
// 				if (!res.headerSent) res.end();
// 			}).catch(function(error) {
// 				polka.onError(error, req, res, _.noop)
// 			})
// 		})
// 	}
// } as typeof polka


