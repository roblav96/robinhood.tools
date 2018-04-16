// 

declare module 'uws' {

	import * as events from 'events'
	import * as http from 'http'
	import * as https from 'https'
	import * as net from 'net'



	interface WebSocketClient extends WebSocket {

	}

	class WebSocketClient extends events.EventEmitter {

	}

	namespace WebSocketClient {

		interface VerifyClientInfo {
			origin: string
			req: http.IncomingMessage
			secure: boolean
		}
		interface VerifyClient {
			(info: VerifyClientInfo): boolean
			(info: VerifyClientInfo, next: (res: boolean) => void): void
		}

		interface PerMessageDeflateOptions {
			clientMaxWindowBits: number
			clientNoContextTakeover: boolean
			memLevel: number
			serverMaxWindowBits: number
			serverNoContextTakeover: boolean
		}

		interface ServerOptions<HttpServer = http.Server | https.Server> {
			host: string
			noDelay: boolean
			noServer: boolean
			path: string
			perMessageDeflate: boolean | Partial<PerMessageDeflateOptions>
			port: number
			server: HttpServer
			verifyClient: VerifyClient
		}

		class Server<T extends WebSocketClient> extends events.EventEmitter {
			constructor(options: Partial<ServerOptions>, listening?: () => void)
		}

	}

	export = WebSocketClient

}







// import * as uws from 'uws'
// import * as http from 'http'

// declare module 'uws' {
// 	export interface Server {
// 		_passedHttpServer: http.Server
// 		httpServer: http.Server
// 		broadcast(message: string, options?: { binary: boolean }): void
// 		startAutoPing(interval: number, message: string): void
// 		on(event: 'listening', fn: () => void): this
// 		addListener(event: 'listening', fn: () => void): this
// 	}
// }

// declare global {
// 	// interface WebSocket extends uws { }
// 	namespace NodeJS { interface Global { WebSocket: uws & WebSocket } }
// }


