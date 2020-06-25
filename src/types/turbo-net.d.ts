//

declare module 'turbo-net' {
	import { EventEmitter } from 'events'

	namespace Server {
		interface Options {
			allowHalfOpen?: boolean
		}
		interface Events {
			close: void[]
			connection: [Connection, void]
			error: [Error, void]
			listening: void[]
		}
		interface Address {
			address: string
			family: string
			port: number
		}
	}
	export class Server extends EventEmitter {
		constructor(options?: Server.Options)
		_address: string
		_closed: boolean
		allowHalfOpen: boolean
		connections: Connection[]
		address(): Server.Address
		close(cb?: () => void): void
		listen(cb?: () => void): void
		listen(port?: number, cb?: () => void): void
		listen(port?: number, address?: string, cb?: () => void): void
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
	export function createServer(handler?: (socket: Connection) => void): Server
	export function createServer(
		options?: Server.Options,
		handler?: (socket: Connection) => void,
	): Server

	namespace Connection {
		interface Options {
			allowHalfOpen?: boolean
		}
		interface Events {
			close: void[]
			connect: void[]
			end: void[]
			error: [Error, void]
			finish: void[]
		}
	}
	export class Connection extends EventEmitter {
		constructor(server: Server)
		_handle: Buffer
		_paused: boolean
		_server: Server
		allowHalfOpen: boolean
		closed: boolean
		ended: boolean
		finished: boolean
		readable: boolean
		writable: boolean
		close(cb?: () => void): void
		end(cb?: () => void): void
		read(buffer: Buffer, cb: (error: Error, buffer: Buffer, bytesRead: number) => void): void
		write(buffer: Buffer, cb?: (error: Error, buffer: Buffer, length: number) => void): void
		write(
			buffer: Buffer,
			length?: number,
			cb?: (error: Error, buffer: Buffer, length: number) => void,
		): void
		writev(
			buffers: Buffer[],
			cb?: (error: Error, buffers: Buffer[], lengths: number[]) => void,
		): void
		writev(
			buffers: Buffer[],
			lengths?: number[],
			cb?: (error: Error, buffers: Buffer[], lengths: number[]) => void,
		): void
		emit<Name extends keyof Connection.Events>(
			event: Name,
			arg0?: Connection.Events[Name][0],
			arg1?: Connection.Events[Name][1],
		): boolean
		on<Name extends keyof Connection.Events>(
			event: Name,
			fn: (arg0?: Connection.Events[Name][0], arg1?: Connection.Events[Name][1]) => void,
		): this
		once<Name extends keyof Connection.Events>(
			event: Name,
			fn: (arg0?: Connection.Events[Name][0], arg1?: Connection.Events[Name][1]) => void,
		): this
		addListener<Name extends keyof Connection.Events>(
			event: Name,
			fn: (arg0?: Connection.Events[Name][0], arg1?: Connection.Events[Name][1]) => void,
		): this
	}
	export function connect(port: number, host?: string, options?: Connection.Options): Connection
}
