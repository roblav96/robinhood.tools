// 

declare module 'turbo-http' {
	import * as turbo from 'turbo-net'
	import * as Request from 'turbo-http/lib/request'
	import * as Response from 'turbo-http/lib/response'

	namespace Server {
		interface Options extends turbo.Server.Options {

		}
		interface Events extends turbo.Server.Events {
			'request': [Request, Response]
		}
	}
	export class Server extends turbo.Server {
		constructor(options: Server.Options)
		emit<Name extends keyof Server.Events>(event: Name, arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1])
		on<Name extends keyof Server.Events>(event: Name, fn: (arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1]) => void)
		once<Name extends keyof Server.Events>(event: Name, fn: (arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1]) => void)
		addListener<Name extends keyof Server.Events>(event: Name, fn: (arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1]) => void)
	}
	export function createServer(handler?: (req: Request, res: Response) => void): Server
	export function createServer(options?: Server.Options, handler?: (req: Request, res: Response) => void): Server

}

declare module 'turbo-http/lib/request' {
	import { Connection } from 'turbo-net'

	namespace Request {
		interface Options {
			headers: string[]
			method: number
			shouldKeepAlive: boolean
			upgrade: boolean
			url: string
			versionMajor: number
			versionMinor: number
		}
	}
	class Request {
		constructor(socket: Connection, options: Request.Options)
		_options: Request.Options
		method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE' | 'OPTIONS'
		socket: Connection
		url: string
		getAllHeaders(): Map<string, string>
		getHeader(header: string): string
		ondata(buffer: Buffer, start: number, length: number): void
		onend(): void
	}
	export = Request

}

declare module 'turbo-http/lib/response' {
	import { Connection } from 'turbo-net'
	import { Server } from 'turbo-http'

	namespace Response { }
	class Response {
		constructor(server: Server, socket: Connection, headers: Buffer)
		_headers: Buffer
		_headersLength: number
		headerSent: boolean
		server: Server
		socket: Connection
		statusCode: number
		end(buffer: Buffer | string, length?: number, cb?: () => void)
		endv(buffers: (Buffer | string)[], lengths?: number[], cb?: () => void)
		setHeader(name: string, value: string)
		write(buffer: Buffer | string, length?: number, cb?: () => void)
		writev(buffers: (Buffer | string)[], lengths?: number[], cb?: () => void)
	}
	export = Response

}


