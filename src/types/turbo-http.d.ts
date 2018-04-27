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
	import * as turbo from 'turbo-net'

	namespace Request { }
	class Request {
		constructor(socket: turbo.Connection, options)
		method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE' | 'OPTIONS'
	}
	export = Request

}

declare module 'turbo-http/lib/response' {
	import * as turbo from 'turbo-net'

	namespace Response { }
	class Response {
		constructor(socket, options)
	}
	export = Response

}


