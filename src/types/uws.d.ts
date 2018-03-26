// 

import * as uws from 'uws'



declare module 'uws' {
	export interface Server {
		broadcast(message: string, options?: { binary: boolean }): void
		startAutoPing(interval: number, message: string): void
	}
}

// declare global {
// 	export interface WebSocket extends uws { }
// 	export namespace NodeJS {
// 		export interface Global {
// 			WebSocket: uws
// 		}
// 	}
// }


