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
			'request': [any, any]
		}
	}
	export class Server extends turbo.Server {
		constructor(options: Server.Options)
		emit<Name extends keyof Server.Events>(event: Name, arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1])
		on<Name extends keyof Server.Events>(event: Name, fn: (arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1]) => void)
		once<Name extends keyof Server.Events>(event: Name, fn: (arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1]) => void)
		addListener<Name extends keyof Server.Events>(event: Name, fn: (arg0?: Server.Events[Name][0], arg1?: Server.Events[Name][1]) => void)
	}
	export function createServer(handler?: Server.Handler): Server
	export function createServer(options?: Server.Options, handler?: Server.Handler): Server



}


