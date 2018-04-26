// 

import WebSocketClient from '../../common/websocket.client'
import * as _ from '../../common/lodash'
import * as onexit from 'exit-hook'
import * as os from 'os'
import * as http from 'http'
import * as uws from 'uws'



const wss = new uws.Server({
	host: process.env.HOST,
	port: +process.env.PORT + os.cpus().length,
	path: `websocket/${process.env.INSTANCE}`,

	verifyClient(incoming, next) {
		// console.log('incoming ->', incoming)
		next(true)
	},

})

wss.on('listening', function() { console.info('wss listening ->', wss.httpServer.address().port) })
onexit(function() { wss.httpServer.close() })

wss.on('error', function(error) { console.error('wss Error ->', error) })

wss.on('connection', function(client: uws.WebSocket, req: http.IncomingMessage) {
	// console.log('req.headers ->', req.headers)

	client.on('message', function(message: string) {
		if (message == 'pong') return;
		if (message == 'ping') return client.send('pong');
		client.close(1003, 'Sending messages via the client not allowed!')
	})

	client.on('close', function(code, reason) {
		client.terminate()
		client.removeAllListeners()
	})

	client.on('error', function(error) { console.error('client Error ->', error) })

})

export default wss


// process.on('SIGTERM', function() { wss.httpServer.close() })
// wss.httpServer.listen(+process.env.PORT, process.env.HOST, function(error) {
// 	if (error) return console.error('listen Error ->', error);
// 	console.info('listening ->', process.env.PORT)
// })





declare module 'uws' {
	interface WebSocket {
		// alive: boolean
		// uuid: string
	}
}





setImmediate(function() {
	let address = `ws://${process.env.DOMAIN}/websocket/${process.env.INSTANCE}`
	let ws = new WebSocketClient(address, {
		// verbose: true,
	})
	ws.on('message', function onmessage(message) { console.log('onmessage ->', message) })
	ws.on('open', function onopen() { console.info('onopen ->', address) })
	ws.on('close', function onclose(code, reason) { console.warn('onclose ->', code, reason) })
	ws.on('error', function onerror(error) { console.error('onerror ->', error) })
})


