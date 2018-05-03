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



{ (Polka as any).Router = Polka().constructor }
export default class PolkaRouter extends Polka.Router<PolkaServer, PolkaRequest, PolkaResponse> {

	validators = {} as Dict<{
		[key: string]: FastestValidator.CompiledValidator
		params?: FastestValidator.CompiledValidator
		query?: FastestValidator.CompiledValidator
		body?: FastestValidator.CompiledValidator
	}>

	route(opts: {
		method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'
		url: string
		public?: boolean
		schema?: {
			[key: string]: FastestValidator.Schema
			params?: FastestValidator.Schema
			query?: FastestValidator.Schema
			body?: FastestValidator.Schema
		}
		handler(req: PolkaRequest, res: PolkaResponse): any
	}) {
		if (opts.schema) {
			this.validators[opts.url] = {}
			Object.keys(opts.schema).forEach(key => {
				let schema = opts.schema[key]
				this.validators[opts.url][key] = new FastestValidator().compile(schema)
			})
		}
		this.add(opts.method, opts.url, (req, res) => {
			if (!req.authed && !opts.public) {
				let error = boom.unauthorized(req.path)
				return this.onError(error, req, res, _.noop)
			}
			Promise.resolve().then(() => {
				return opts.handler(req, res)
			}).then(data => res.send(data)).catch(error => {
				this.onError(error, req, res, _.noop)
			})
		})
	}

	hook(handler: (req: PolkaRequest, res: PolkaResponse) => any) {
		this.use((req, res, next) => {
			Promise.resolve().then(() => handler(req, res)).then(next).catch(next)
		})
	}

}

