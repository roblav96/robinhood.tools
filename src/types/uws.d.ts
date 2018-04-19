// 

import * as uws from 'uws'
import * as http from 'http'

declare module 'uws' {
	export interface WebSocket extends uws { }
	export interface Server {
		_passedHttpServer: http.Server
		httpServer: http.Server
		broadcast(message: string, options?: { binary: boolean }): void
		startAutoPing(interval: number, message: string): void
		on(event: 'listening', fn: () => void): this
		addListener(event: 'listening', fn: () => void): this
	}
	export const native: any
}

declare global {
	// interface WebSocket extends uws { }
	namespace NodeJS { interface Global { WebSocket: uws & WebSocket } }
}


