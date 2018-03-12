// 



declare module rethinkdbdash {
	export interface PoolMaster extends NodeJS.EventEmitter {
		constructor(r: any, options: any)
		emitStatus(): void
		drain(): Promise<void>
		getAvailableLength(): any
		getLength(): any
		resetBufferParameters(): void
		getNumAvailableConnections(): number
		getNumConnections(): number
		initPool(pool: any): void
		fetchServers(useSeeds?: any): void
		deletePool(key: any): void
		createPool(server: any): void
		createPoolSettings(globalOptions: any, serverOptions: any, log: any): any
		handleAllServersResponse(servers: any): void
		getConnection(): any
		getPools(): any[]
	}

	export interface Pool extends NodeJS.EventEmitter {
		id: any
		options: any
		timeoutReconnect: any
		constructor(r: any, options: any)
		getAddress(): string
		drain(): Promise<void>
		drainLocalhost(): void
		setOptions(options: any): any
		getAvailableLength(): any
		getLength(): any
		createConnection(): Promise<Connection>
		putConnection(connection: Connection): void
		getConnection(): Promise<Connection>
	}

	export interface Connection extends NodeJS.EventEmitter {
		rejectMap: any
		timeout: any
		open: any
		metadata: any
		buffer: any
		token: any
		db: any
		timeoutConnect: any
		authKey: any
		port: any
		host: any
		r: any
		connection: any
		timeoutOpen: any
		constructor(r: any, options: any, resolve: any, reject: any)
		noreplyWait(callback?: (err: any, value?: any) => void): Promise<any>
		noReplyWait(): void
		close(options?: any, callback?: (err: any, value?: any) => void): Promise<any>
		server(callback: any): void
		use(db: any): void
		reconnect(options: any, callback?: (err: any, value?: any) => void): any
	}

	export interface RDash extends rethinkdb.R {
		getPoolMaster(): PoolMaster
		getPool(i: number): Pool
		createPools(options?: any): RDash
		setArrayLimit(arrayLimit: number): void
		setNestingLevel(nestingLevel: number): void
		Error: RError
	}

	export interface RError {
		ReqlDriverError: typeof ReqlDriverError
		ReqlServerError: typeof ReqlServerError
		ReqlRuntimeError: typeof ReqlRuntimeError
		ReqlCompileError: typeof ReqlCompileError
		ReqlClientError: typeof ReqlClientError
	}

	var ReqlDriverError: ReqlDriverError
	interface ReqlDriverError extends Error {
		prototype: Error
		new(message?: string, query?: string, secondMessage?: string): ReqlDriverError
	}

	var ReqlServerError: ReqlServerError
	interface ReqlServerError extends Error {
		prototype: Error
		new(message?: string, query?: string): ReqlServerError
	}

	var ReqlRuntimeError: ReqlRuntimeError
	interface ReqlRuntimeError extends Error {
		prototype: Error
		new(message?: string, query?: string, frames?: string): ReqlRuntimeError
	}

	var ReqlCompileError: ReqlCompileError
	interface ReqlCompileError extends Error {
		prototype: Error
		new(message?: string, query?: string, frames?: string): ReqlCompileError
	}

	var ReqlClientError: ReqlClientError
	interface ReqlClientError extends Error {
		prototype: Error
		new(message?: string): ReqlClientError
	}

	export interface RDashConnect {
		(options?: {
			port?: number,
			host?: string,
			db?: string,
			authKey?: string,
			discovery?: boolean,
			max?: number,
			buffer?: number,
			timeout?: number,
			timeoutError?: number,
			timeoutGb?: number,
			maxExponent?: number,
			silent?: boolean,
			servers?: Array<{ host: string, port: number }>,
			optionalRun?: boolean,
			ssl?: boolean,
			pool?: boolean,
			cursor?: boolean
		}): RDash
	}
	export interface RDashConnectionOptions extends rethinkdb.RConnectionOptions {
		cursor: boolean
	}
}

declare module rethinkdb {
	// override RRunable to extend it with PromiseLike<T>
	export interface RRunable<T> extends PromiseLike<T> {
		run(connection: rethinkdbdash.Connection, cb: CallbackFunction<T>): void
		run(cb: CallbackFunction<T>): void
		run(options: rethinkdbdash.RDashConnectionOptions, cb: CallbackFunction<T>): void
		run(connection: rethinkdbdash.Connection, options: rethinkdbdash.RDashConnectionOptions, cb: CallbackFunction<T>): void

		run(connection: rethinkdbdash.Connection, options?: rethinkdbdash.RDashConnectionOptions): Promise<any>
		run(options?: rethinkdbdash.RDashConnectionOptions): Promise<any>
	}

	// note: extends RemoteT to accomodate for automatic coercing with { cursor: false } option
	export interface RCursor<RemoteT> extends NodeJS.EventEmitter {
		eachAsync(process_function: (element: RemoteT) => any): Promise<void> & { error: (errorHandler: (error: Error) => void) => Promise<void> }
	}
}

declare module "rethinkdbdash" {
	var r: rethinkdbdash.RDashConnect
	export = r
}
