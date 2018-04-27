// 

declare module 'turbo-net' {
	import * as http from 'http'

	interface Server extends http.Server {
		connections: any
	}

	interface ServerOptions {
		allowHalfOpen: boolean
	}
	export function createServer(handler?: Function): Server
	export function createServer(opts?: Partial<ServerOptions>, handler?: Function): Server

}


