// 

declare module 'turbo-net' {

	import { EventEmitter } from 'events'



	export namespace Server {
		interface Options { allowHalfOpen?: boolean }
	}
	export class Server extends EventEmitter {
		constructor(options: Server.Options)
		allowHalfOpen: boolean
		connections: Connection[]
		address(): { address: string, family: string, port: number }
		close(fn?: () => void): void
		listen(port: number, address: string, fn?: () => void): void
		on(event: 'close', fn: () => void)
		on(event: 'connection', fn: (socket: Connection) => void)
		on(event: 'listening', fn: () => void)
	}
	export function createServer(fn?: (socket: Connection) => void): Server
	export function createServer(options?: Server.Options, fn?: (socket: Connection) => void): Server



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
		close(fn?: () => void): void
		end(fn?: () => void)
		read(buffer: Buffer, fn: (error: Error, buffer: Buffer, bytesRead: number) => void): void
		write(buffer: Buffer, length: number, fn: (error: Error, buffer: Buffer, length: number) => void)
		writev(buffers: Buffer[], lengths: number[], fn: (error: Error, buffers: Buffer[], lengths: number[]) => void)
		on(event: 'close', fn: () => void)
		on(event: 'connect', fn: () => void)
		on(event: 'end', fn: () => void)
		on(event: 'error', fn: (error: Error) => void)
		on(event: 'finish', fn: () => void)
	}
	export function connect(port: number, host?: string, options?: Connection.Options): Connection



}


