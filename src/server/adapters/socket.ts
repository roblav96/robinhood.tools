// 
export * from '../../common/socket'
// 

import { WS } from '../../common/socket'
import { PolkaRequest } from '../api/polka.request'
import * as exithook from 'exit-hook'
import * as qs from 'querystring'
import * as url from 'url'
import * as os from 'os'
import * as uws from 'uws'
import * as cookie from 'cookie'
import * as fastjsonparse from 'fast-json-parse'
import * as redis from './redis'
import * as security from './security'
import Emitter from '../../common/emitter'



export const wss = new uws.Server({
	host: process.env.HOST,
	port: +process.env.IPORT + os.cpus().length,
	path: `/websocket/${process.env.INSTANCE}`,

	verifyClient(incoming, next: Function) {
		let req = (incoming.req as any) as PolkaRequest
		return Promise.resolve().then(function() {
			req.authed = false

			let cookies = req.headers.cookie
			if (!cookies) return next(false, 412, `Precondition Failed: "cookies"`);

			let cparsed = cookie.parse(cookies)
			let qparsed = qs.parse(url.parse(req.url).query)

			let doc = {
				ip: security.ip(req.headers),
				id: qparsed['x-id'],
				uuid: qparsed['x-uuid'],
				finger: qparsed['x-finger'],
				hostname: req.headers['hostname'],
				useragent: req.headers['user-agent'],
				bits: cparsed['x-bits'],
				token: cparsed['x-token']
			} as Security.Doc

			let failed = security.isDoc(doc)
			if (failed) return next(false, 412, `Precondition Failed: "${failed},"`);
			req.doc = doc

			if (!req.doc.token) return next(true);
			return redis.main.hget(`security:doc:${req.doc.uuid}`, 'prime').then(function(prime) {
				if (prime) req.authed = req.doc.token == security.token(req.doc, prime);
				next(true)
			})

		}).catch(function(error) {
			console.error('verifyClient Error ->', error)
			next(false, 500, 'Internal Server Error')
		})
	}

})

wss.httpServer.timeout = 10000

exithook(function onexit() { wss.close() })

wss.on('listening', function onlistening() {
	console.info('wss listening ->', process.env.HOST + ':' + wss.httpServer.address().port)
})

wss.on('error', function onerror(error) {
	console.error('wss Error ->', error)
})

wss.on('connection', function onconnection(client: Socket.Client, req: PolkaRequest) {
	client.subs = []
	client.authed = req.authed
	client.doc = req.doc

	client.on('message', function onmessage(message: string) {
		if (message == 'pong') return;
		if (message == 'ping') return client.send('pong');

		if (message[0] == WS.ACT) {
			if (message.substr(1, WS.SUBS.length) == WS.SUBS) {
				client.subs = JSON.parse(message.substr(WS.SUBS.length + 1))
				return
			}
		}

		let parsed = fastjsonparse(message)
		if (parsed.err) return client.close(1007, parsed.err.message);
		let event = parsed.value as Socket.Event

		console.log('client event ->', event)



		// client.close(1003, 'Sending messages via the client not allowed!')
	})

	client.on('close', function onclose(code, reason) {
		if (process.env.PRIMARY) console.warn('client close ->', code, reason);
		client.doc = null
		client.subs.splice(0)
		client.terminate()
		client.removeAllListeners()
	})

	client.on('error', function onerror(error) { console.error('client Error ->', error) })

})



const SUBS = {} as Dict<Socket.Client[]>

export function emit() {

}





// import * as Sockette from 'sockette'
// import WebSocketClient from '../../common/websocket.client'
// setImmediate(function() {
// 	const address = `ws://${process.env.DOMAIN}/websocket/${process.env.INSTANCE}`
// 	const ws = new WebSocketClient(address, {
// 		timeout: '1s',
// 		heartbeat: '5s',
// 		// verbose: true,
// 	})
// 	// const ws = new Sockette(address, {
// 	// 	timeout: 1000,
// 	// 	maxAttempts: Infinity,
// 	// 	onopen: event => console.info('onopen ->', address),
// 	// 	onclose: event => console.warn('onclose ->', event.code, event.reason),
// 	// 	onmessage: event => console.log('onmessage ->', event.data),
// 	// 	onerror: event => console.error('onerror ->', event),
// 	// })
// })


