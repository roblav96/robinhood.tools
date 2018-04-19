// 

import { IncomingMessage } from 'http'
import * as _ from '../../common/lodash'
import * as uws from 'uws'
import * as cookie from 'cookie'
import * as url from 'url'
import * as qs from 'querystring'
import * as security from '../services/security'
import WebSocketServer from '../adapters/websocket.server'
import fastify from '../api/fastify'



const wss = new uws.Server({
	path: 'websocket/' + process.INSTANCE,
	server: fastify.server,
	verifyClient(incoming, next) {
		
		console.log('incoming ->', incoming)

		let ip = security.getip(incoming.req)
		let headers = incoming.req.headers as Dict<string>
		let query = qs.parse(url.parse(incoming.req.url).query) as Dict<string>
		let cookies = cookie.parse(headers['cookie']) as Dict<string>

		security.authorize({
			doc: {
				id: query['x-id'],
				uuid: query['x-uuid'],
				finger: query['x-finger'],
				bytes: cookies['x-bytes'],
				token: cookies['x-token'],
				hostname: security.sha1(headers['hostname']),
				useragent: security.sha1(headers['user-agent']),
			},
			keys: _.concat(Object.keys(headers), Object.keys(query), Object.keys(cookies)),
			required: ['origin', 'x-bytes', 'x-token'],
			origin: headers['origin'],

		}).then(function(authed) {
			next(authed)

		}).catch(function(error) {
			if (DEVELOPMENT) console.error('verifyClient Error ->', error.message || error);
			next(false)
		})

	},
})

// wss.on('listening', function() { console.info('listening ->', wss.httpServer.address()) })
wss.on('error', function(error) { console.error('wss.on Error ->', error) })

wss.on('connection', function(client: uws.WebSocket, req: IncomingMessage) {

	client.on('message', function(message: string) {
		if (message == 'pong') return;
		if (message == 'ping') return client.send('pong');
		client.close(1003, 'Sending messages via the client not allowed!')
		client.terminate()
		client.removeAllListeners()
	})

	client.on('close', function(code, reason) {
		console.warn('onclose ->', code, '->', reason);
	})
	client.on('error', function(error) { console.error('client.on Error ->', error) })

})

export default wss



// fastify.addHook('onClose', function(fastify, done) {
// 	wss.close(done)
// })

// fastify.decorate('wss', wss)
// declare module 'fastify' { interface FastifyInstance { wss: typeof wss } }




