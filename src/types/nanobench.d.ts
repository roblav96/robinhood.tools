//

declare module 'nanobench' {
	namespace nanobench {
		interface Suite {
			start(): void
			end(): void
			error(error: Error): void
			log(message: string): void
		}
		function skip(name: string, run: (suite: Suite) => void): void
		function only(name: string, run: (suite: Suite) => void): void
	}
	function nanobench(name: string, run: (suite: nanobench.Suite) => void): void
	export = nanobench
}
