// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as ee4 from '../../common/ee4'

import * as uws from 'uws'
import uWebSocket from '../../common/uwebsocket'



const HOST = 'localhost'
const PATH = 'radio'
const PORT = process.PORT - 1
const ADDRESS = 'ws://' + HOST + ':' + PORT + '/' + PATH

if (process.MASTER) {

	const wss = new uws.Server({
		host: HOST, port: PORT, path: PATH,
		verifyClient(incoming, next) {
			next(incoming.req.headers['host'] == 'localhost')
		},
	})

	const onmessage = function(this: uws, message: string) {
		if (message == '_onopen_') {
			if (wss.clients.length > process.INSTANCES) {
				wss.broadcast('_onready_')
			}
			return
		}
		wss.broadcast(message)
	}

	wss.on('connection', function(socket) {
		socket.on('message', onmessage)
	})

	wss.on('error', function(error) {
		console.error('onerror Error ->', error)
	})

}



class Radio extends ee4.EventEmitter {

	private _socket = new uWebSocket(uws, ADDRESS, { verbose: false, retrytimeout: 1000 })

	constructor() {
		super()
		this._socket.on('open', () => {
			super.emit('_onopen_')
			this._socket.send('_onopen_')
		})
		this._socket.on('message', (message: Radio.Message) => {
			if ((message as any) == '_onready_') return super.emit('_onready_');
			message = JSON.parse(message as any)
			super.emit(message.event, message.data)
		})
	}

	emit(event: string, data?: any) {
		return !!this._socket.json({ event, data } as Radio.Message)
	}

}

export default new Radio()





declare global {
	namespace Radio {
		type radio = Radio
		interface Message<T = any> {
			event: string
			data?: T
		}
	}
}





