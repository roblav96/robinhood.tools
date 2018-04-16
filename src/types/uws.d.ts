// 

declare module 'uws' {

	import * as events from 'events'
	import * as http from 'http'
	import * as https from 'https'
	import * as net from 'net'



	class WebSocket {

	}

	class WebSocketClient extends WebSocket {
		static OPEN: number
		static CLOSED: number
		OPEN: number
		CLOSED: number
		readyState: number
	}

	namespace WebSocketClient {

		// interface WebSocketClient extends WebSocket {

		// }

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

		interface MessageOptions {
			binary?: boolean
		}

		class Server<T extends WebSocketClient = WebSocketClient> extends events.EventEmitter {
			constructor(options: Partial<ServerOptions>, callback?: () => void)
			handleUpgrade(request: http.IncomingMessage, socket: net.Socket, upgradeHead: ArrayBuffer, callback: (client: T) => void): void
			startAutoPing(interval: number, message?: string): void
			broadcast(message: string, options?: MessageOptions): void
			close(cb?: (error?: any) => void): void
			clients: T[]
		}

		// interface Clients<T = any> {
		// 	length: number
		// 	forEach<T>(client: T): void
		// }

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


