// 

import { Server as PolkaServer } from 'turbo-http'
import { PolkaRequest } from './polka.request'
import { PolkaResponse } from './polka.response'
import * as _ from '../../common/lodash'
import * as util from 'util'
import * as Polka from 'polka'
import * as Trouter from 'trouter'
import * as boom from 'boom'
import * as FastestValidator from 'fastest-validator'
import polka from './polka'



export default class Route {

	private validators = {} as {
		[key: string]: FastestValidator.CompiledValidator
		params?: FastestValidator.CompiledValidator
		query?: FastestValidator.CompiledValidator
		body?: FastestValidator.CompiledValidator
	}

	constructor(
		private opts: {
			method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'
			url: string
			schemas?: {
				[key: string]: FastestValidator.Schema
				params?: FastestValidator.Schema
				query?: FastestValidator.Schema
				body?: FastestValidator.Schema
			}
			handler: (req: PolkaRequest, res: PolkaResponse) => Promise<void>
		},
	) {
		this.opts.schemas = this.opts.schemas || {}
		Object.keys(this.opts.schemas).forEach(key => {
			let schema = this.opts.schemas[key]
			this.validators[key] = new FastestValidator().compile(schema)
		})
		if (opts.url[0] == '/') opts.url = '/api' + opts.url;
		polka[opts.method.toLowerCase()](opts.url, this.handler)
	}

	private handler = (req: PolkaRequest, res: PolkaResponse) => {
		this.phandler(req, res).then(function onthen(response) {
			if (res.headerSent) {
				throw boom.resourceGone('route handler -> res.headerSent', { url: req.url })
			}
			if (response == null) return res.end();
			res.send(response)
		}).catch(function onerror(error) {
			polka.onError(error, req, res, _.noop)
		})//.finally(function onfinally() { console.log('finally') })
	}

	private async phandler(req: PolkaRequest, res: PolkaResponse) {
		let keys = Object.keys(this.validators)
		let i: number, len = keys.length
		for (i = 0; i < len; i++) {
			let key = keys[i]
			let value = req[key]
			let validator = this.validators[key]
			if (validator && value == null) throw boom.preconditionRequired(key);
			let invalid = validator(value)
			if (Array.isArray(invalid)) {
				throw boom.preconditionFailed(key, { [key]: value, reason: invalid, url: req.url })
			}
		}
		let response = await this.opts.handler(req, res)
		return response
	}

}


