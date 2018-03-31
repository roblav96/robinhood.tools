// 

import * as uws from 'uws'
import * as http from 'http'



declare module 'uws' {

	export interface Server {
		_passedHttpServer: http.Server
		httpServer: http.Server

		broadcast(message: string, options?: { binary: boolean }): void
		startAutoPing(interval: number, message: string): void

		on(event: 'listening', fn: (this: Server) => void): this
		addListener(event: 'listening', fn: (this: Server) => void): this

		on(event: 'connection', fn: (this: WebSocket, client: WebSocket, req: http.IncomingMessage) => void): this
		addListener(event: 'connection', fn: (this: WebSocket, client: WebSocket, req: http.IncomingMessage) => void): this

	}

}

declare global {
	// interface WebSocket extends uws { }
	namespace NodeJS { interface Global { WebSocket: uws & WebSocket } }
}


