// 

import { Server as PolkaServer } from 'turbo-http'
import PolkaRequest from './polka.request'
import PolkaResponse from './polka.response'
import * as _ from '../../common/lodash'
import * as exithook from 'exit-hook'
import * as turbo from 'turbo-http'
import * as Polka from 'polka'
import * as boom from 'boom'
import * as FastestValidator from 'fastest-validator'



const polka = Polka<PolkaServer, PolkaRequest, PolkaResponse>({

	onError(error: boom<any>, req, res, next) {
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

polka.get('/api/hello', function hello(req, res) { res.end() })

export default polka


