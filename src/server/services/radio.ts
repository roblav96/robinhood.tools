// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as ee4 from '../../common/ee4'

import * as uws from 'uws'
import uWebSocket from '../../common/uwebsocket'



const HOST = '127.0.0.1'
const PATH = 'radio'
const PORT = process.PORT - 1
const ADDRESS = 'ws://' + HOST + ':' + PORT + '/' + PATH

if (process.MASTER) {

	const wss = new uws.Server({
		host: HOST, port: PORT, path: PATH,
		verifyClient(incoming, next) {
			next(incoming.req.headers['host'] == HOST)
		},
	})

	// wss.on('listening', function(this: uws.Server) { console.info('listening ->', this.httpServer.address()) })
	wss.on('error', function(this: uws.Server, error) {
		console.error('wss.on Error ->', error)
	})

	wss.on('connection', function(this: uws.Server, socket) {
		socket.on('message', onmessage)
		socket.on('error', onerror)
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

	const onerror = function(this: uws, error: Error) {
		console.error('socket.on Error ->', error)
	}

}



class Radio extends ee4.EventEmitter {

	private _socket = new uWebSocket(ADDRESS, {
		startdelay: process.MASTER ? 1 : -1,
		// verbose: process.MASTER,
	})

	private _onopen = () => {
		this._socket.send('_onopen_')
		super.emit('_onopen_')
	}

	private _onmessage = (message: Radio.Message) => {
		if ((message as any) == '_onready_') return super.emit('_onready_');
		message = JSON.parse(message as any)
		super.emit(message.event, message.data)
	}

	constructor() {
		super()
		this._socket.on('open', this._onopen)
		this._socket.on('message', this._onmessage)
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





