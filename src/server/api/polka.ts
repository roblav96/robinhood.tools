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
			if (!process.env.BENCHMARK) console.error('polka onError ->', error);
			error = new boom(error, { message: error.message })
		} else {
			if (error.data) Object.assign(error.output.payload, { attributes: error.data });
			if (!process.env.BENCHMARK) console.warn('polka onError ->', error.output.payload);
		}
		if (res.headerSent) return;
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
		this.onError(boom.notFound(method.concat(path), { method, path }), req, res, _.noop)
	},

})

const server = turbo.createServer(polka.handler)
server.listen(+process.env.IPORT, process.env.HOST, function onlisten() {
	console.info('turbo listening ->', process.env.HOST + ':' + process.env.IPORT)
})

exithook(function onexit() {
	if (Array.isArray(server.connections)) server.connections.forEach(v => v.close());
	server.close()
})

export default polka



polka.get('/api/blank', function blank(req, res) { res.end() })

polka.route({
	method: 'GET',
	url: '/api/route',
	handler(req, res) { res.end() },
})

polka.route({
	method: 'GET',
	url: '/api/validate/:valid',
	schema: {
		params: { valid: 'string' }
	},
	handler(req, res) { res.end() },
})


