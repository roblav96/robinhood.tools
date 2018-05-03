// 
export * from '../../common/socket'
// 

import { WS } from '../../common/socket'
import { IncomingMessage, ClientRequest } from 'http'
import * as exithook from 'exit-hook'
import * as qs from 'querystring'
import * as url from 'url'
import * as os from 'os'
import * as uws from 'uws'
import * as cookie from 'cookie'
import * as jsonparse from 'fast-json-parse'
import * as boom from 'boom'
import * as security from './security'
import Emitter from '../../common/emitter'



const wss = new uws.Server({
	host: process.env.HOST,
	port: +process.env.IPORT + os.cpus().length,
	path: `/websocket/${process.env.INSTANCE}`,

	verifyClient({ req }, next) {
		// let ip = security.reqip(req)
		// if (ip == process.env.HOST) return next(true);
		console.log('req ->', req)
		// let cookies = cookie.parse(req.headers.cookie)
		// let query = qs.parse(url.parse(req.url).query)
		let doc = {
			// ip: security.reqip(req),
			// id: req.headers['x-id'],
			// uuid: req.headers['x-uuid'],
			// finger: req.headers['x-finger'],
			// stamp: req.headers['x-stamp'] as any,
			// hostname: req.headers['hostname'],
			// useragent: req.headers['user-agent'],
			// bytes: req.cookies['x-bytes'],
			// token: req.cookies['x-token'],
		} as Security.Doc
		// next(false)
		next(false, 403, 'no way bro')
		// next(true)
	},

})

wss.httpServer.timeout = 10000
wss.httpServer.keepAliveTimeout = 100

exithook(function onexit() {
	wss.clients.forEach(v => v.close(1001))
	wss.close()
})

wss.on('listening', function onlistening() {
	console.info('wss listening ->', process.env.HOST + ':' + wss.httpServer.address().port)
})

wss.on('error', function onerror(error) {
	console.error('wss Error ->', error)
})

wss.on('connection', function onconnection(client: uws.WebSocket, req: IncomingMessage) {
	// console.log('req.headers ->', req.headers)

	client.on('message', function onmessage(message: string) {
		if (message == 'pong') return;
		if (message == 'ping') return client.send('pong');
		// if (message.indexOf(WS.SYNC) == 0) {
		// 	let subs = JSON.parse(message.substr(WS.SYNC.length))
		// 	console.log('subs ->', subs)
		// 	return
		// }
		console.log('client message ->', message)
		// client.close(1003, 'Sending messages via the client not allowed!')
	})

	client.on('close', function onclose(code, reason) {
		console.warn('client close ->', code, reason)
		client.terminate()
		client.removeAllListeners()
	})

	client.on('error', function onerror(error) { console.error('client Error ->', error) })

})

export default wss



export function emit() {

}



declare module 'uws' {
	interface WebSocket {
		// alive: boolean
		// uuid: string
	}
}





import * as Sockette from 'sockette'
import WebSocketClient from '../../common/websocket.client'
setImmediate(function() {
	const address = `ws://${process.env.DOMAIN}/websocket/${process.env.INSTANCE}`
	const ws = new WebSocketClient(address, {
		timeout: '1s',
		heartbeat: '5s',
		// verbose: true,
	})
	// const ws = new Sockette(address, {
	// 	timeout: 1000,
	// 	maxAttempts: Infinity,
	// 	onopen: event => console.info('onopen ->', address),
	// 	onclose: event => console.warn('onclose ->', event.code, event.reason),
	// 	onmessage: event => console.log('onmessage ->', event.data),
	// 	onerror: event => console.error('onerror ->', event),
	// })
})


