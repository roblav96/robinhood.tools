// 

import * as http from 'http'
import * as _ from 'lodash'
import * as uws from 'uws'
import * as Rx from '../../common/rxjs'
import WebSocketClient from '../../common/websocket.client'
import Emitter from '../../common/emitter'



let wss: uws.Server
const HOST = process.HOST
const PORT = process.PORT - 1
const PATH = 'radio'

if (process.MASTER) {

	wss = new uws.Server({
		host: HOST, port: PORT, path: PATH,
		verifyClient(incoming, next) {
			let host = incoming.req.headers['host']
			next(host == process.HOST)
		},
	})
	// wss.on('listening', function() { console.info('listening ->', wss.httpServer.address()) })
	wss.on('error', function(error) { console.error('wss.on Error ->', error) })

	wss.on('connection', function(client: Radio.Client, req: http.IncomingMessage) {
		if (!Array.isArray(client.subs)) client.subs = [];

		client.on('message', function(message: string) {
			if (message == 'pong') return;
			if (message == 'ping') return client.send('pong');
			if (message == '_onopen_') {
				if (wss.clients.length > process.INSTANCES) {
					wss.broadcast('_onready_')
				}
				return
			}
			wss.broadcast(message)
		})

		client.on('close', function(code: number, message: string) {
			client.terminate()
			client.removeAllListeners()
		})

		client.on('error', function(error) { console.error('socket.on Error ->', error) })

	})

}



export const ready = new Rx.ReadySubject()
const emitter = new Emitter()
const socket = new WebSocketClient(`ws://${HOST}:${PORT}/${PATH}`, {
	autoStart: false,
	// verbose: process.MASTER,
	// verbose: true,
})

const connect = _.once(() => socket.connect())
if (process.MASTER) wss.once('listening', connect);
else setImmediate(connect);

socket.on('open', function() {
	socket.send('_onopen_')
})

socket.on('message', function(message: string) {
	if (message == '_onready_') {
		return ready.next(true)
	}
	let event = JSON.parse(message) as Radio.Event
	emitter.emit(event.e, event.d)
})

export function emit(event: string, data?: any) {
	socket.json({ e: event, d: data } as Radio.Event)
}





declare global {
	namespace Radio {
		interface Client extends uws {
			subs: string[]
		}
		interface Event<T = any> {
			/** ▶ event name */
			e: string
			/** ▶ data */
			d: T
		}
	}
}


