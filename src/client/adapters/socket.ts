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
	) {

	}

}



class Socket extends ee4.EventEmitter {

	clients: Client[]
	init = _.once((addresses: string[]) => {
		this.clients = addresses.map(v => new Client(v))
	})

	constructor() {
		super()
	}

}

export default new Socket()







