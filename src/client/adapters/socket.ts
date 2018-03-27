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

	private _socket = new uWebSocket(this.address, {
		query() { return qs.stringify(_.defaults(security.headers())) },
		// verbose: true,
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

	init = _.once(() => {
		return http.get('/socket/addresses').then((addresses: string[]) => {
			this._clients = addresses.map((v, i) => new Client(v, i))
		})
	})

}

export default new Socket()







