// 

declare module 'turbo-net' {

	import { EventEmitter } from 'events'



	namespace Server {
		interface Options {
			allowHalfOpen?: boolean
		}
		// interface Events {
		// 	close: () => void
		// 	connection: (socket: Connection) => void
		// 	listening: () => void
		// 	// [event: string]: any
		// }

	}
	class Events { }
	interface Events extends EventEmitter {
		on(event: 'close', fn: () => void)
		on(event: 'connection', fn: (socket: Connection) => void)
		on(event: 'listening', fn: () => void)
	}
	export class Server extends Events {
		constructor(options: Server.Options)
		allowHalfOpen: boolean
		connections: Connection[]
		address(): { address: string, family: string, port: number }
		close(cb?: () => void): void
		listen(port: number, address: string, cb?: () => void): void
		// on<Name extends keyof Server.Events>(event: Name, fn: Server.Events[Name])
		// on(event: string, fn: () => void)

		// on(event: 'close', fn: () => void)
		// on(event: 'connection', fn: (socket: Connection) => void)
		// on(event: 'listening', fn: () => void)
		// on(event: string, fn: (...args: any[]) => void)
		// on(event: any, fn: any)
	}
	export function createServer(handler?: (socket: Connection) => void): Server
	export function createServer(options?: Server.Options, handler?: (socket: Connection) => void): Server



	export namespace Connection {
		interface Options { allowHalfOpen?: boolean }
	}
	export class Connection extends EventEmitter {
		constructor(server: Server)
		allowHalfOpen: boolean
		closed: boolean
		ended: boolean
		finished: boolean
		readable: boolean
		writable: boolean
		close(cb?: () => void): void
		end(cb?: () => void)
		read(buffer: Buffer, callback: (error: Error, buffer: Buffer, bytesRead: number) => void): void
		write(buffer: Buffer, length: number, callback: (error: Error, buffer: Buffer, length: number) => void)
		writev(buffers: Buffer[], lengths: number[], callback: (error: Error, buffers: Buffer[], lengths: number[]) => void)
		on(event: 'close', fn: () => void)
		on(event: 'connect', fn: () => void)
		on(event: 'end', fn: () => void)
		on(event: 'error', fn: (error: Error) => void)
		on(event: 'finish', fn: () => void)
	}
	export function connect(port: number, host?: string, options?: Connection.Options): Connection



}


