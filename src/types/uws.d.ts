// 

import * as uws from 'uws'
import * as http from 'http'



declare module 'uws' {
	export interface Server {
		_passedHttpServer: http.Server
		httpServer: http.Server
		broadcast(message: string, options?: { binary: boolean }): void
		startAutoPing(interval: number, message: string): void
		on(event: 'listening', cb: () => void): this
		addListener(event: 'listening', cb: () => void): this
	}
}

declare global {
	// interface WebSocket extends uws { }
	namespace NodeJS { interface Global { WebSocket: uws & WebSocket } }
}


