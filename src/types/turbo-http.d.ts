//

declare module 'turbo-http' {
	import * as turbo from 'turbo-net'
	import * as TurboRequest from 'turbo-http/lib/request'
	import * as TurboResponse from 'turbo-http/lib/response'

	namespace Server {
		type Methods = 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE' | 'OPTIONS'
		interface Events extends turbo.Server.Events {
			request: [TurboRequest, TurboResponse]
		}
	}
	export class Server extends turbo.Server {
		constructor(options?: turbo.Server.Options)
		emit<Name extends keyof Server.Events>(
			event: Name,
			arg0?: Server.Events[Name][0],
			arg1?: Server.Events[Name][1],
		): boolean
		on<Name extends keyof Server.Events>(
			event: Name,
			fn: (arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1]) => void,
		): this
		once<Name extends keyof Server.Events>(
			event: Name,
			fn: (arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1]) => void,
		): this
		addListener<Name extends keyof Server.Events>(
			event: Name,
			fn: (arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1]) => void,
		): this
	}
	export function createServer(handler?: (req: TurboRequest, res: TurboResponse) => void): Server
	export function createServer(
		options?: turbo.Server.Options,
		handler?: (req: TurboRequest, res: TurboResponse) => void,
	): Server
}

declare module 'turbo-http/lib/request' {
	import { Connection } from 'turbo-net'
	import { Server } from 'turbo-http'

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
			method: Server.Methods
			socket: Connection
			url: string
			getAllHeaders(): Map<string, string>
			getHeader(header: string): string
			ondata(buffer: Buffer, start: number, length: number): void
			onend(): void
		}
	}
	interface TurboRequest extends TurboRequest.TurboRequest {}
	class TurboRequest {}
	export = TurboRequest
}

declare module 'turbo-http/lib/response' {
	import { Connection } from 'turbo-net'
	import { Server } from 'turbo-http'

	namespace TurboResponse {
		class TurboResponse {
			constructor(server: Server, socket: Connection, headers: Buffer)
			headerSent: boolean
			server: Server
			socket: Connection
			statusCode: number
			end(cb?: () => void): void
			end(buffer?: Buffer | string, cb?: () => void): void
			end(buffer?: Buffer | string, length?: number, cb?: () => void): void
			endv(buffers: (Buffer | string)[], cb?: () => void): void
			endv(buffers: (Buffer | string)[], lengths?: number[], cb?: () => void): void
			setHeader(name: string, value: string | number): void
			write(buffer: Buffer | string, cb?: () => void): void
			write(buffer: Buffer | string, length?: number, cb?: () => void): void
			writev(buffers: (Buffer | string)[], cb?: () => void): void
			writev(buffers: (Buffer | string)[], lengths?: number[], cb?: () => void): void
		}
	}
	interface TurboResponse extends TurboResponse.TurboResponse {}
	class TurboResponse {}
	export = TurboResponse
}
