// 

declare module 'final-pm' {

	export interface Configuration {
		'applications': Application[]
		'config-path': string
		'daemon-log': string
		'home': string
		'ignore-env': string[]
		'is-local': boolean
		'npm-global-config': string
		'npm-user-config': string
		'socket': string
		'socket-host': string
		'socket-path': string
		'socket-port': string
	}

	export interface Application {
		'args': string[]
		'base-path': string
		'builtin': boolean
		'config-path': string
		'cwd': string
		'env': Partial<NodeJS.ProcessEnv>
		'instances': number
		'kill-signal': string
		'log-retention-timeout': number
		'logger': string
		'logger-args': string[]
		'max-buffered-log-bytes': number
		'max-instances': number
		'max-log-line-length': number
		'mode': string
		'name': string
		'node-args': string[]
		'ready-on': string
		'restart-crashing': boolean
		'restart-crashing-delay': number
		'restart-new-crashing': boolean
		'run': string
		'start-timeout': number
		'stop-signal': string
		'stop-timeout': number
		'type': string
		'unique-instances': boolean
	}

	export class daemon {
		constructor(...args: any[])
		checkWaiting(...args: any[]): void
		close(...args: any[]): void
		getLogger(...args: any[]): void
		listen(...args: any[]): void
		loadBuiltins(...args: any[]): void
		spawn(...args: any[]): void
		spawnCopy(...args: any[]): void
		static defaultMaxListeners: number
		static init(): void
		static launch(config: any): any
		static listenerCount(emitter: any, type: any): any
		static usingDomains: boolean
	}

	export const version: string

	export namespace client {
		function ConnectionError(...args: any[]): void
		function connect(url: any): any
		namespace ConnectionError {
			const stackTraceLimit: number
			function captureStackTrace(p0: any, p1: any): any
			namespace prototype {
				const message: string
				const name: string
				function toString(): any
			}
		}
	}

	export namespace config {
		function ConfigError(...args: any[]): void
		function getConfig(options: any): any
		function normalize(config: any): any
		function normalizeArray(configs: any): any
		function resolveConfig(configPath: any): any
		namespace ConfigError {
			const stackTraceLimit: number
			function captureStackTrace(p0: any, p1: any): any
			namespace prototype {
				const message: string
				const name: string
				function toString(): any
			}
		}

		namespace applicationSchema {
			const isImmutable: boolean
			const isJoi: boolean
			const schemaType: string
			function allow(...args: any[]): void
			function and(...args: any[]): void
			function append(...args: any[]): void
			function applyFunctionToChildren(...args: any[]): void
			function assert(...args: any[]): void
			function checkOptions(...args: any[]): void
			function clone(...args: any[]): void
			function concat(...args: any[]): void
			function createError(...args: any[]): void
			function createOverrideError(...args: any[]): void
			function describe(...args: any[]): void
			function description(...args: any[]): void
			function disallow(...args: any[]): void
			function empty(...args: any[]): void
			function equal(...args: any[]): void
			function error(...args: any[]): void
			function example(...args: any[]): void
			function exist(...args: any[]): void
			function forbidden(...args: any[]): void
			function forbiddenKeys(...args: any[]): void
			function invalid(...args: any[]): void
			function keys(...args: any[]): void
			function label(...args: any[]): void
			function length(...args: any[]): void
			function max(...args: any[]): void
			function meta(...args: any[]): void
			function min(...args: any[]): void
			function nand(...args: any[]): void
			function not(...args: any[]): void
			function notes(...args: any[]): void
			function only(...args: any[]): void
			function optional(...args: any[]): void
			function optionalKeys(...args: any[]): void
			function options(...args: any[]): void
			function or(...args: any[]): void
			function pattern(...args: any[]): void
			function raw(...args: any[]): void
			function rename(...args: any[]): void
			function required(...args: any[]): void
			function requiredKeys(...args: any[]): void
			function schema(...args: any[]): void
			function strict(...args: any[]): void
			function strip(...args: any[]): void
			function tags(...args: any[]): void
			function type(...args: any[]): void
			function unit(...args: any[]): void
			function unknown(...args: any[]): void
			function valid(...args: any[]): void
			function validate(...args: any[]): void
			function when(...args: any[]): void
			function without(...args: any[]): void
			function xor(...args: any[]): void
		}

		namespace configSchema {
			const isImmutable: boolean
			const isJoi: boolean
			const schemaType: string
			function allow(...args: any[]): void
			function and(...args: any[]): void
			function append(...args: any[]): void
			function applyFunctionToChildren(...args: any[]): void
			function assert(...args: any[]): void
			function checkOptions(...args: any[]): void
			function clone(...args: any[]): void
			function concat(...args: any[]): void
			function createError(...args: any[]): void
			function createOverrideError(...args: any[]): void
			function describe(...args: any[]): void
			function description(...args: any[]): void
			function disallow(...args: any[]): void
			function empty(...args: any[]): void
			function equal(...args: any[]): void
			function error(...args: any[]): void
			function example(...args: any[]): void
			function exist(...args: any[]): void
			function forbidden(...args: any[]): void
			function forbiddenKeys(...args: any[]): void
			function invalid(...args: any[]): void
			function keys(...args: any[]): void
			function label(...args: any[]): void
			function length(...args: any[]): void
			function max(...args: any[]): void
			function meta(...args: any[]): void
			function min(...args: any[]): void
			function nand(...args: any[]): void
			function not(...args: any[]): void
			function notes(...args: any[]): void
			function only(...args: any[]): void
			function optional(...args: any[]): void
			function optionalKeys(...args: any[]): void
			function options(...args: any[]): void
			function or(...args: any[]): void
			function pattern(...args: any[]): void
			function raw(...args: any[]): void
			function rename(...args: any[]): void
			function required(...args: any[]): void
			function requiredKeys(...args: any[]): void
			function schema(...args: any[]): void
			function strict(...args: any[]): void
			function strip(...args: any[]): void
			function tags(...args: any[]): void
			function type(...args: any[]): void
			function unit(...args: any[]): void
			function unknown(...args: any[]): void
			function valid(...args: any[]): void
			function validate(...args: any[]): void
			function when(...args: any[]): void
			function without(...args: any[]): void
			function xor(...args: any[]): void
		}
	}

	export namespace daemon {
		class EventEmitter {
			constructor()
			addListener(type: any, listener: any): any
			emit(type: any, args: any): any
			eventNames(): any
			getMaxListeners(): any
			listenerCount(type: any): any
			listeners(type: any): any
			on(type: any, listener: any): any
			once(type: any, listener: any): any
			prependListener(type: any, listener: any): any
			prependOnceListener(type: any, listener: any): any
			rawListeners(type: any): any
			removeAllListeners(type: any, ...args: any[]): any
			removeListener(type: any, listener: any): any
			setMaxListeners(n: any): any
			static EventEmitter: any
			static defaultMaxListeners: number
			static init(): void
			static listenerCount(emitter: any, type: any): any
			static usingDomains: boolean
		}
	}

}
