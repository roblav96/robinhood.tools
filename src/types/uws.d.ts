// 

import * as uws from 'uws'



declare module 'uws' {
	export interface Server {
		broadcast(message: string, options?: { binary: boolean }): void
		startAutoPing(interval: number, message: string): void
		on(event: 'listening', cb: () => void): this
		addListener(event: 'listening', cb: () => void): this
	}
}

// declare global {
// 	export interface WebSocket extends uws { }
// 	export namespace NodeJS { export interface Global { WebSocket: uws } }
// }


