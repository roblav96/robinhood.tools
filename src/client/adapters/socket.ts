// 

import * as _ from 'lodash'
import * as core from '@/common/core'
import * as ee4 from '@/common/ee4'
import uWebSocket from '@/common/uwebsocket'
import pdelay from 'delay'
import qs from 'querystring'
import * as security from '../services/security'
import * as http from './http'



class Client {

	socket = new uWebSocket(this.address, {
		query() { return qs.stringify(_.defaults(security.headers())) },
		verbose: true,
	})

	constructor(
		public address: string,
		public index: number,
	) {

	}

}



class Socket {

	private _ee4 = new ee4.EventEmitter()
	private _clients = [] as Client[]

	constructor() {

	}

	private _cons: number
	private _onopen = () => {
		this._cons--
		if (this._cons > 0) return;
		console.log('socket clients ->', 'ready')
	}

	init = _.once(() => {
		// return http.get('/socket/addresses').then((addresses: string[]) => {
		// 	this._cons = addresses.length
		// 	this._clients = addresses.map((v, i) => {
		// 		let client = new Client(v, i)
		// 		client.socket.once('open', this._onopen)
		// 		return client
		// 	})
		// })
	})

}

export default new Socket()







