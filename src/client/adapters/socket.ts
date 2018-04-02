// 

import * as _ from 'lodash'
import Emitter from '@/common/emitter'
import WebSocketClient from '@/common/websocket.client'
import qs from 'querystring'
import * as security from '../services/security'
import * as http from './http'



class Client {

	socket = new WebSocketClient(this.address, {
		query() { return qs.stringify(_.defaults(security.headers())) },
		verbose: true,
	})

	constructor(
		public address: string,
	) {

	}

}



class Socket extends Emitter {

	clients: Client[]
	init = _.once((addresses: string[]) => {
		this.clients = addresses.map(v => new Client(v))
	})

	constructor() {
		super()
	}

}

const socket = new Socket()
export default socket







