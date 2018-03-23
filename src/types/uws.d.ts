// 

import * as _uws from 'uws'



declare module 'uws' {
	export interface Server {
		broadcast(message: string, options?: { binary: boolean }): void
		startAutoPing(interval: number, message: string): void
	}
}


