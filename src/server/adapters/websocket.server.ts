// 

import * as uws from 'uws'



class WebSocketServer extends uws.Server {

	isopens() {
		let isopens = 0
		this.clients.forEach(function(client) {
			if (client.isopen) isopens++;
		})
		return isopens
	}

	find(uuid: string) {
		let found: uws.WebSocket
		this.clients.forEach(function(client) {
			if (found) return;
			if (client.uuid == uuid) found = client;
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





import { IncomingMessage } from 'http'
declare module 'uws' {
	export interface WebSocket extends uws {
		isopen: boolean
		uuid: string
	}
	export interface Server {
		// on(event: 'connection', fn: (this: WebSocketServer, client: uws.WebSocket, req: IncomingMessage) => void): this
	}
}


