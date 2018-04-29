// 

import { Server as PolkaServer } from 'turbo-http'
import { PolkaRequest } from './polka.request'
import { PolkaResponse } from './polka.response'
import * as _ from '../../common/lodash'
import * as exithook from 'exit-hook'
import * as http from 'http'
import * as turbo from 'turbo-http'
import * as Polka from 'polka'
import * as boom from 'boom'
import PolkaRoute from './polka.route'



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



const server = turbo.createServer(polka.handler)

server.listen(+process.env.IPORT, process.env.HOST, function onlisten() {
	console.info('turbo listening ->', process.env.HOST + ':' + process.env.IPORT)
})

exithook(function onexit() {
	if (Array.isArray(server.connections)) server.connections.forEach(v => v.close());
	server.close()
})



export default polka



polka.get('/api/hello', function hello(req, res) { res.send() })

// new PolkaRoute({
// 	method: 'GET',
// 	url: '/hello',
// 	async handler(req, res) { },
// })


