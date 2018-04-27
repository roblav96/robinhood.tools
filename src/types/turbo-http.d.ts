// 

declare module 'turbo-http' {

	import { EventEmitter } from 'events'
	import * as turbo from 'turbo-net'



	namespace Server {
		interface Options extends turbo.Server.Options {

		}
		interface Handler {
			(req, res): void
		}
		interface Events extends turbo.Server.Events {
			'request': Server.Handler
		}
	}
	type Both = Server & turbo.Server
	interface Server extends Both {
		on(event: 'request', fn: Server.Handler)
		
	}
	export class Server extends turbo.Server {
		constructor(options: Server.Options)
		emit<Name extends keyof Connection.Events>(event: Name, value: Connection.Events[Name])
		on<Name extends keyof Connection.Events>(event: Name, fn: (value: Connection.Events[Name]) => void)
		once<Name extends keyof Connection.Events>(event: Name, fn: (value: Connection.Events[Name]) => void)
		addListener<Name extends keyof Connection.Events>(event: Name, fn: (value: Connection.Events[Name]) => void)
	}
	export function createServer(handler?: Server.Handler): Server
	export function createServer(options?: Server.Options, handler?: Server.Handler): Server



}


