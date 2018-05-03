// 
export { WS } from '../../common/redis.keys'
// 

import { WS } from '../../common/redis.keys'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as security from '../adapters/security'
import * as exithook from 'exit-hook'
import * as os from 'os'
import * as http from 'http'
import * as uws from 'uws'
import * as Sockette from 'sockette'
import Emitter from '../../common/emitter'



const wss = new uws.Server({
	host: process.env.HOST,
	port: +process.env.IPORT + os.cpus().length,
	path: `websocket/${process.env.INSTANCE}`,

	verifyClient(incoming, next) {
		// if (security.reqip(incoming.req) == process.env.HOST) {
		// 	return next(true)
		// }
		// console.log('incoming ->', incoming)
		next(true)
	},

})

wss.on('listening', function onlistening() { console.info('wss listening ->', wss.httpServer.address().port) })
exithook(function onexit() { wss.httpServer.close() })

wss.on('error', function onerror(error) { console.error('wss Error ->', error) })

wss.on('connection', function onconnection(client: uws.WebSocket, req: http.IncomingMessage) {
	// console.log('req.headers ->', req.headers)

	client.on('message', function onmessage(message: string) {
		if (message == 'pong') return;
		if (message == 'ping') return client.send('pong');
		if (message.indexOf(WS.SYNC) == 0) {
			let subs = JSON.parse(message.substr(WS.SYNC.length))
			console.log('subs ->', subs)
			return
		}
		console.warn('client message ->', message)
		client.close(1003, 'Sending messages via the client not allowed!')
	})

	client.on('close', function onclose(code, reason) {
		console.warn('client close ->', code, reason)
		client.terminate()
		client.removeAllListeners()
	})

	client.on('error', function onerror(error) { console.error('client Error ->', error) })

})

export default wss





declare global {
	namespace Socket {
		interface Message {
			name: string
			data: any
		}
	}
}

declare module 'uws' {
	interface WebSocket {
		// alive: boolean
		// uuid: string
	}
}





// setImmediate(function() {
// 	const address = `ws://${process.env.DOMAIN}/websocket/${process.env.INSTANCE}`
// 	const ws = new Sockette(address, {
// 		timeout: 1000,
// 		maxAttempts: Infinity,
// 		onopen: event => console.info('onopen ->', address),
// 		onclose: event => console.warn('onclose ->', event.code, event.reason),
// 		onmessage: event => console.log('onmessage ->', event.data),
// 		onerror: event => console.error('onerror ->', event),
// 	})
// })

