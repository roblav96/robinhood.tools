// 

declare module 'turbo-http' {
	import * as turbo from 'turbo-net'
	import * as TurboRequest from 'turbo-http/lib/request'
	import * as TurboResponse from 'turbo-http/lib/response'

	namespace Server {
		interface Events extends turbo.Server.Events {
			'request': [TurboRequest, TurboResponse]
		}
	}
	export class Server extends turbo.Server {
		constructor(options?: turbo.Server.Options)
		emit<Name extends keyof Server.Events>(event: Name, arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1])
		on<Name extends keyof Server.Events>(event: Name, fn: (arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1]) => void)
		once<Name extends keyof Server.Events>(event: Name, fn: (arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1]) => void)
		addListener<Name extends keyof Server.Events>(event: Name, fn: (arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1]) => void)
	}
	export function createServer(handler?: (req: TurboRequest, res: TurboResponse) => void): Server
	export function createServer(options?: turbo.Server.Options, handler?: (req: TurboRequest, res: TurboResponse) => void): Server

}

declare module 'turbo-http/lib/request' {
	import { Connection } from 'turbo-net'

	namespace TurboRequest {
		interface Options {
			headers: string[]
			method: number
			shouldKeepAlive: boolean
			upgrade: boolean
			url: string
			versionMajor: number
			versionMinor: number
		}
		class TurboRequest {
			constructor(socket: Connection, options: Options)
			_options: Options
			method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE' | 'OPTIONS'
			socket: Connection
			url: string
			getAllHeaders(): Map<string, string>
			getHeader(header: string): string
			ondata(buffer: Buffer, start: number, length: number): void
			onend(): void
		}
	}
	interface TurboRequest extends TurboRequest.TurboRequest { }
	class TurboRequest { }
	export = TurboRequest

}

declare module 'turbo-http/lib/response' {
	import { Connection } from 'turbo-net'
	import { Server } from 'turbo-http'

	namespace TurboResponse {
		class TurboResponse {
			constructor(server: Server, socket: Connection, headers: Buffer)
			_headers: Buffer
			_headersLength: number
			headerSent: boolean
			server: Server
			socket: Connection
			statusCode: number
			end(buffer?: Buffer | string, length?: number, cb?: () => void)
			endv(buffers: (Buffer | string)[], lengths?: number[], cb?: () => void)
			setHeader(name: string, value: string)
			write(buffer: Buffer | string, length?: number, cb?: () => void)
			writev(buffers: (Buffer | string)[], lengths?: number[], cb?: () => void)
		}
	}
	interface TurboResponse extends TurboResponse.TurboResponse { }
	class TurboResponse { }
	export = TurboResponse

}


