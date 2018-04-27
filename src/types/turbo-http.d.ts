// 

declare module 'turbo-http' {

	import * as turbo from 'turbo-net'



	export namespace Server {
		type Handler = (req, res) => void
		// interface Events extends turbo.Server.Events {
		// 	request: Handler
		// }
	}
	type TEvents = typeof turbo.Events
	interface Events extends TEvents {
		on(event: 'request', fn: (req, res) => void)
	}
	class Events { }
	export class Server extends Events {
		constructor(options: turbo.Server.Options)

		// on<Name extends keyof Server.Events>(event: Name, fn: Server.Events[Name])

		// on(event: 'request', fn: (req, res) => void)
		// on(event: string, fn: (...args: any[]) => void)
		// on(event: any, fn: any)

	}
	export function createServer(handler?: Server.Handler): Server
	export function createServer(options?: turbo.Server.Options, handler?: Server.Handler): Server



}


