//

import { Server as PolkaServer } from 'turbo-http'
import { PolkaRequest } from './polka.request'
import { PolkaResponse } from './polka.response'
import * as _ from '../../common/lodash'
import * as util from 'util'
import * as Polka from 'polka'
import * as boom from 'boom'
import * as matchit from 'matchit'
import * as FastestValidator from 'fastest-validator'

declare global {
	namespace Api {
		interface RouterSchemaMap<T> {
			[key: string]: T
			params?: T
			query?: T
			body?: T
		}
	}
}

{
	;(Polka as any).Router = Polka().constructor
}
export default class PolkaRouter extends Polka.Router<PolkaServer, PolkaRequest, PolkaResponse> {
	schemas = {} as Dict<Api.RouterSchemaMap<FastestValidator.Schema>>
	validators = {} as Dict<Api.RouterSchemaMap<FastestValidator.CompiledValidator>>
	rhdocurls = {} as Dict<boolean>

	route(opts: {
		method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'
		url: string
		authed?: boolean
		rhdoc?: boolean
		schema?: Api.RouterSchemaMap<FastestValidator.Schema>
		handler(req: PolkaRequest, res: PolkaResponse): any
	}) {
		if (opts.rhdoc) {
			this.rhdocurls[opts.url] = true
		}
		if (opts.schema) {
			this.schemas[opts.url] = {}
			this.validators[opts.url] = {}
			Object.keys(opts.schema).forEach((key) => {
				let schema = opts.schema[key]
				this.schemas[opts.url][key] = schema
				this.validators[opts.url][key] = new FastestValidator().compile(schema)
			})
		}
		this.add(opts.method, opts.url, (req, res) => {
			if (opts.authed && !req.authed) {
				return this.onError(boom.unauthorized('!req.authed'), req, res, _.noop)
			}
			Promise.resolve()
				.then(() => {
					return opts.handler(req, res)
				})
				.then((data) => res.send(data))
				.catch((error) => {
					this.onError(error, req, res, _.noop)
				})
		})
	}

	hook(fn: (req: PolkaRequest, res: PolkaResponse) => any) {
		this.use((req, res, next) => {
			Promise.resolve()
				.then(() => fn(req, res))
				.then(next)
				.catch(next)
		})
	}
}
