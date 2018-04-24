// 

const WebSocketServer = require('clusterws/dist').uWebSocketServer as typeof uws.Server
import WebSocketClient from '../../common/websocket.client'
import * as _ from '../../common/lodash'
import * as os from 'os'
import * as http from 'http'
import * as uws from 'uws'



const wss = new WebSocketServer({
	host: process.env.HOST,
	port: +process.env.PORT + os.cpus().length,
	path: `websocket/${process.env.INSTANCE}`,

	verifyClient(incoming, next) {
		// console.log('incoming ->', incoming)
		next(true)
	},

})

wss.on('listening', function() { console.info('wss listening ->', wss.httpServer.address().port) })
process.on('SIGTERM', function() { wss.httpServer.close() })

wss.on('error', function(error) { console.error('wss Error ->', error) })

wss.on('connection', function(client) {
	
})



// process.on('SIGTERM', function() { wss.httpServer.close() })
// wss.httpServer.listen(+process.env.PORT, process.env.HOST, function(error) {
// 	if (error) return console.error('listen Error ->', error);
// 	console.info('listening ->', process.env.PORT)
// })



export default wss





declare module 'uws' {
	interface WebSocket {
		// alive: boolean
		// uuid: string
	}
}





setImmediate(function() {
	// let address = `ws://${process.env.HOST}:${PORT}/websocket/${process.env.INSTANCE}`
	let address = `ws://${process.env.DOMAIN}/websocket/${process.env.INSTANCE}`
	let ws = new WebSocketClient(address, {
		// verbose: true,
	})
	ws.on('message', function(message) { console.log('onmessage ->', message) })
	ws.on('open', function() { console.info('onopen ->', address) })
	ws.on('close', function(code, reason) { console.warn('onclose ->', code, reason) })
	ws.on('error', function(error) { console.error('onerror ->', error) })
})


