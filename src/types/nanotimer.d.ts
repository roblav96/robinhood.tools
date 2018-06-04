// 

declare module 'nanotimer' {

	namespace NanoTimer {
		// type Units = 's' | 'm' | 'u' | 'n'
		interface TimeoutResults {
			waitTime: number
		}
	}

	class NanoTimer {
		constructor(log?: boolean)
		setTimeout(task: (...args: any[]) => void, args: any[], timeout: string, callback?: (results: NanoTimer.TimeoutResults) => void)
		clearTimeout(): void
		setInterval(task: (...args: any[]) => void, args: any[], interval: string, callback?: (error: Error) => void)
		clearInterval(): void
		time(task: (cb: () => void) => void, args: string | any[], interval: string, callback?: (error: Error) => void)
		hasTimeout(): boolean
	}

	export = NanoTimer

}


