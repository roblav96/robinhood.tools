// 

import * as _ from 'lodash'
import * as core from '@/common/core'
import * as ee4 from '@/common/ee4'
import ticks from '@/common/ticks'
import uWebSocket from '@/common/uwebsocket'
import * as http from './http'



class Client {

	private _socket = new uWebSocket(this.address, {
		heartrate: ticks.T3,
		verbose: true,
	})

	constructor(
		private address: string,
		private index: number,
	) {
		
	}

}



class Socket extends ee4.EventEmitter {

	private _addresses = [] as string[]
	private _clients = [] as Client[]

	constructor() {
		super()
		http.get<any, string[]>('/socket/addresses').then(addresses => {
			this._addresses = addresses
			this._clients = addresses.map((v, i) => new Client(v, i))
		})
	}

}

export default new Socket()







