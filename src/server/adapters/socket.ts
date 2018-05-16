// 

export * from '../../common/socket'
import * as core from '../../common/core'
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

export const wss = new uws.Server({
	host: process.env.HOST, port,

	verifyClient(incoming, next: (allow: boolean, code?: number, message?: string) => void) {
		let req = (incoming.req as any) as PolkaRequest
		// if (process.env.DEVELOPMENT) return next(true);
		Promise.resolve().then(function() {
			req.authed = false

			let cookies = req.headers.cookie
			if (!cookies) return next(false, 412, `Precondition Failed: "cookies"`);

			let cparsed = cookie.parse(cookies)
			let qparsed = qs.parse(url.parse(req.url).query)

			let doc = {
				ip: security.ip(req.headers),
				uuid: qparsed['x-uuid'],
				finger: qparsed['x-finger'],
				hostname: req.headers['hostname'],
				useragent: req.headers['user-agent'],
				bits: cparsed['x-bits'],
				token: cparsed['x-token']
			} as Security.Doc

			let failed = security.isDoc(doc)
			if (failed) return next(false, 412, `Precondition Failed: "${failed}"`);
			req.doc = doc

			if (!req.doc.token) return next(true);
			return security.reqDoc(req, true).then(() => next(true))

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
	doc: Security.Doc
}
function onconnection(client: Client, req: PolkaRequest) {
	client.subs = []
	client.authed = req.authed
	client.doc = req.doc

	client.on('message', function onmessage(message: string) {
		if (message == 'pong') return;
		if (message == 'ping') return this.send('pong');

		let parsed = fastjsonparse(message)
		if (parsed.err) return this.close(1007, parsed.err.message);
		let event = parsed.value as Socket.Event

		if (event.action) {
			let action = event.action
			if (action == 'sync') {
				event.subs.remove(v => {
					if (v.indexOf(rkeys.WS.UUID) == 0) {
						let uuid = v.split(':').pop()
						return uuid != this.doc.uuid
					}
					return false
				})
				// console.log('event.subs ->', event.subs)
				this.subs.forEach(v => emitter.off(v, this.send, this))
				this.subs.splice(0, Infinity, ...event.subs)
				this.subs.forEach(v => emitter.on(v, this.send, this))
				// console.log('this.subs ->', this.subs)
				return
			}
		}

		this.close(1003, 'Invalid message')
	})

	client.on('close', function onclose(code, reason) {
		if (code != 1001) console.warn('client close ->', code, reason);
		core.object.nullify(this.doc)
		this.subs.forEach(v => emitter.off(v, this.send, this))
		this.terminate()
		this.removeAllListeners()
	})

	client.on('error', function onerror(error) { console.error('client Error ->', error) })

}

export function emit(name: string, data?: any) {
	if (emitter.listenerCount(name) == 0) return;
	emitter.emit(name, JSON.stringify({ name, data } as Socket.Event))
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


