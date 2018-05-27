// 

import '../main'
import { IncomingMessage } from 'http'
import * as exithook from 'exit-hook'
import * as Sockette from 'sockette'
import * as uws from 'uws'



const port = +process.env.PORT - 1
const wss = new uws.Server({
	host: 'localhost', port, path: 'radio',
	verifyClient(incoming, next: (allow: boolean, code?: number, message?: string) => void) {
		next(incoming.req.headers['host'] == `localhost:${port}`)
	},
})

// wss.httpServer.timeout = 10000

wss.on('error', function onerror(error) {
	console.error('wss Error ->', error)
})

wss.on('listening', function onlistening() {
	console.info('wss listening ->', port)
})

wss.on('connection', function onconnection(client: Radio.Client, req: IncomingMessage) {

	client.on('message', function onmessage(message: string) {
		if (message == 'pong') return;
		if (message == 'ping') return this.send('pong');
		if (message == '__onopen__') {
			if (wss.clients.length == +process.env.TOTAL) {
				wss.broadcast('__onready__')
			}
			return
		}
		wss.broadcast(message)
	})

	client.on('close', function onclose(code, reason) {
		if (code > 1001) console.warn('client close ->', code, reason);
		this.terminate()
		this.removeAllListeners()
	})

	client.on('error', function onerror(error) { console.error('client Error ->', error) })

})

exithook(() => wss.close())



declare global {
	namespace Radio {
		interface Client extends uws.WebSocket {

		}
	}
}


