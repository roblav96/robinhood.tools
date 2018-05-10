// 

import { Server as PolkaServer } from 'turbo-http'
import { PolkaRequest } from './polka.request'
import { PolkaResponse } from './polka.response'
import * as _ from '../../common/lodash'
import * as exithook from 'exit-hook'
import * as turbo from 'turbo-http'
import * as Polka from 'polka'
import * as boom from 'boom'
import * as pandora from 'pandora'
import PolkaRouter from './polka.router'



const polka = new PolkaRouter({

	onError(error: boom<any>, req, res, next) {
		if (!error.isBoom) {
			console.error('polka onError ->', error);
			error = new boom(error, { message: error.message })
		}
		if (res.headerSent) return;
		error.data = error.data || {}
		error.data.method = req.method
		error.data.path = req.path
		Object.assign(error.output.payload, { attributes: error.data });
		console.warn('polka onError ->', error.output.payload);
		res.statusCode = error.output.statusCode
		let keys = Object.keys(error.output.headers)
		if (keys.length > 0) {
			keys.forEach(k => res.setHeader(k, error.output.headers[k]))
		}
		res.send(error.output.payload)
	},

	onNoMatch(req, res) {
		if (res.headerSent) return;
		let { method, path } = req
		polka.onError(boom.notFound(`${method} ${path}`, { method, path }), req, res, _.noop)
	},

})

const server = turbo.createServer(polka.handler)
server.listen(+process.env.PORT + +process.env.INSTANCE, process.env.HOST, function onlisten() {
	let address = server.address()
	console.info('api listening ->', address.port)
})

exithook(function() { server.close() })

export default polka



// polka.get('/api/blank', function blank(req, res) { res.end() })

// polka.route({
// 	method: 'GET',
// 	url: '/api/route',
// 	handler(req, res) { return Promise.resolve() },
// })

// polka.route({
// 	method: 'GET',
// 	url: '/api/validate/:valid',
// 	schema: {
// 		params: { valid: 'string' }
// 	},
// 	handler(req, res) { return Promise.resolve() },
// })


