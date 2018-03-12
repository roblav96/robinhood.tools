// 

import * as uws from 'uws'

declare module 'uws' {

	interface Server {
		broadcast(message: any, options: { binary: boolean }): void
		startAutoPing(interval: number, message: any): void
	}

}


