// 

import * as _ from 'lodash'
import * as core from '@/common/core'
import * as ee4 from '@/common/ee4'
import pdelay from 'delay'
import uWebSocket from '@/common/uwebsocket'
import * as http from './http'



class Client {

	private _socket = new uWebSocket(this.address, {
		verbose: true,
	})

	constructor(
		public address: string,
		public index: number,
	) {

	}

}



class Socket {

	ee4 = new ee4.EventEmitter()
	private _addresses = [] as string[]
	private _clients = [] as Client[]

	constructor() {

	}

	init = _.once(() => {
		http.get('/socket/addresses').then(addresses => {
			this._addresses = addresses
			this._clients = addresses.map((v, i) => new Client(v, i))
		})
	})

	off(event: string, fn: (...args: any[]) => void, context?: any) {
		return this
	}

}

export default new Socket()







