// 

import { Server as PolkaServer } from 'turbo-http'
import { PolkaRequest } from './polka.request'
import { PolkaResponse } from './polka.response'
import * as _ from '../../common/lodash'
import * as exithook from 'exit-hook'
import * as turbo from 'turbo-http'
import * as Polka from 'polka'
import * as boom from 'boom'
import * as fkill from 'fkill'
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
		Object.assign(error.output.payload, { attributes: error.data })
		console.warn('polka onError ->', error.output.payload) //, '\r\nattributes ->', error.output.payload.attributes)
		res.statusCode = error.output.statusCode
		Object.keys(error.output.headers).forEach(k => res.setHeader(k, error.output.headers[k]))
		error.output.payload.isBoom = true
		res.send(error.output.payload)
	},

	onNoMatch(req, res) {
		let { method, path } = req
		polka.onError(boom.notFound(`${method} ${path}`, { method, path }), req, res, _.noop)
	},

})



const server = turbo.createServer(polka.handler)
const port = +process.env.PORT + +process.env.INSTANCE
server.listen(port, process.env.HOST, function onlisten() {
	let address = server.address()
	console.info('api listening ->', address.port)
})
// fkill(`:${port}`).finally(function() {
// 	return new Promise(function(resolve) {
// 		server.listen(port, process.env.HOST, resolve)
// 	})
// }).then(function() {
// 	let address = server.address()
// 	console.info('api listening ->', address.port)
// })

exithook(function() {
	server.connections.forEach(v => v.close())
	server.close()
})

export default polka



// polka.get('/api/blank', function blank(req, res) { res.end('') })
// polka.route({
// 	method: 'GET',
// 	url: '/api/promise',
// 	public: true,
// 	handler(req, res) { return '' },
// })
// polka.route({
// 	method: 'GET',
// 	url: '/api/async',
// 	public: true,
// 	async handler(req, res) { return '' },
// })


