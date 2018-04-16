// 

import * as uws from 'uws'

// let wss = new uws.Server({port: 1234})
// console.log('uws.native ->', uws.native)
// console.warn('uws.native ->', console.dtsgen(uws.native))

class WebSocketServer extends uws.Server {

	// constructor(options?: uws.IServerOptions, callback?: Function) {
	// 	super(options, callback)
	// 	process.on('SIGINT', () => this.close())
	// }

	connections() {
		let total = 0
		this.clients.forEach(function(client) {
			if (client.isopen) {
				total++
			}
		})
		return total
	}

	find(uuid: string) {
		let found: uws.WebSocket
		this.clients.forEach(function(client) {
			if (found) return;
			if (client.uuid == uuid) {
				found = client
			}
		})
		return found
	}

	send(uuids: string[], message: string) {
		this.clients.forEach(function(client) {
			if (uuids.includes(client.uuid)) {
				client.send(message)
			}
		})
	}

}

export default WebSocketServer





// declare module 'uws' {
// 	export interface WebSocket extends uws {
// 		isopen: boolean
// 		uuid: string
// 	}
// }


