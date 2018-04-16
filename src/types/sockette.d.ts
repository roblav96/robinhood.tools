// 

declare module 'sockette' {

	namespace Sockette {
		interface Options {
			protocols: string[]
			timeout: number
			maxAttempts: number
			onopen: () => void
			onerror: (error: Error) => void
			onclose: (code: number, message: string) => void
			onmessage: (event: any) => void
			onreconnect: (event: any) => void
			onmaximum: (event: any) => void
		}
	}

	class Sockette {
		constructor(address: string, options: Partial<Sockette.Options>)
		send(data: any): void
		close(code?: number, reason?: string): void
		json(data: any): void
		reconnect(): void
		open(): void
	}

	export = Sockette

}


