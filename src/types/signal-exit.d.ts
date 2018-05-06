// 

declare module 'signal-exit' {

	namespace SignalExit {
		interface Handler {
			(code: number, signal: NodeJS.Signals): void
		}
		interface Options {
			alwaysLast: boolean
		}
	}
	function SignalExit(handler: SignalExit.Handler, opts?: SignalExit.Options): void
	export = SignalExit

}


