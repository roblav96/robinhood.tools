// 

export * from '../../common/socket'
import * as rkeys from '../../common/rkeys'
import * as exithook from 'exit-hook'
import * as qs from 'querystring'
import * as url from 'url'
import * as uws from 'uws'
import * as cookie from 'cookie'
import * as fastjsonparse from 'fast-json-parse'
import * as pandora from './pandora'
import * as redis from './redis'
import * as security from './security'
import { PolkaRequest } from '../api/polka.request'
import Emitter from '../../common/emitter'



const port = +process.env.PORT + +process.env.OFFSET + +process.env.INSTANCE
pandora.on('socket.listening', function(hubmsg) {
	pandora.send({ clientId: hubmsg.host.clientId }, 'socket.listening', { port })
})

const wss = new uws.Server({
	host: process.env.HOST, port,

	verifyClient(incoming, next: (allow: boolean, code?: number, message?: string) => void) {
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
			return redis.main.hget(`${rkeys.SECURITY.DOC}:${req.doc.uuid}`, 'prime').then(function(prime) {
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

wss.on('error', function onerror(error) {
	console.error('wss Error ->', error)
})

wss.on('listening', function onlistening() {
	let address = wss.httpServer.address()
	console.info('wss listening ->', address.port)
	pandora.broadcast({ processName: 'api' }, 'socket.onlistening', { port: address.port })
})

wss.on('connection', onconnection)

exithook(function onexit() { wss.close() })



const emitter = new Emitter()

interface Client extends uws.WebSocket {
	subs: string[]
	authed: boolean
	id: string
	uuid: string
}
function onconnection(client: Client, req: PolkaRequest) {
	client.subs = []
	client.authed = req.authed
	client.id = req.doc.id
	client.uuid = req.doc.uuid

	client.on('message', function onmessage(message: string) {
		if (message == 'pong') return;
		if (message == 'ping') return this.send('pong');

		let parsed = fastjsonparse(message)
		if (parsed.err) return this.close(1007, parsed.err.message);
		let event = parsed.value as Socket.Event

		if (event.action) {
			let action = event.action
			if (action == 'sync') {
				this.subs.forEach(v => emitter.off(v, this.send, this))
				this.subs.splice(0, Infinity, ...event.subs)
				this.subs.forEach(v => emitter.on(v, this.send, this))
				return
			}
		}

		this.close(1003, 'Invalid message')
	})

	client.on('close', function onclose(code, reason) {
		if (code != 1001) console.warn('client close ->', code, reason);
		this.subs.forEach(v => emitter.off(v, this.send, this))
		this.terminate()
		this.removeAllListeners()
	})

	client.on('error', function onerror(error) { console.error('client Error ->', error) })

}

export function emit(name: string, data?: any) {
	let count = emitter.listenerCount(name)
	if (count == 0) return;
	emitter.emit(name, JSON.stringify(data))
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


