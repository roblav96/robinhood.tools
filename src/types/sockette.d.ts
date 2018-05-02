// 

declare module 'sockette' {

	namespace Sockette {
		interface Options {
			protocols: string[]
			timeout: number
			maxAttempts: number
			onopen: (event: Event) => void
			onclose: (event: CloseEvent) => void
			onmessage: (event: MessageEvent) => void
			onerror: (event: Event) => void
			onreconnect: (event: Event) => void
			onmaximum: (event: CloseEvent) => void
		}
	}

	class Sockette {
		constructor(address: string, options: Partial<Sockette.Options>)
		send(message: string): void
		close(code?: number, reason?: string): void
		json(data: any): void
		reconnect(): void
		open(): void
	}

	export = Sockette

}


