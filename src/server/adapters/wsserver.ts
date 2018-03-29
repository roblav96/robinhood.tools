// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import * as uws from 'uws'
import * as cookie from 'cookie'
import * as url from 'url'
import * as qs from 'querystring'
import * as security from '../services/security'
import fastify from '../api/fastify'



const wss = new uws.Server({
	path: 'websocket/' + process.INSTANCE,
	server: fastify.server,
	verifyClient(incoming, next) {

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

wss.on('connection', function(socket) {
	socket.on('message', function(message: string) {
		if (message == 'pong') return;
		if (message == 'ping') return socket.send('pong');
		socket.close(1003, 'Sending messages via the client not allowed!')
		socket.terminate()
		socket.removeAllListeners()
	})
})

wss.on('error', function(error) {
	console.error('onerror Error ->', error)
})

export default wss




