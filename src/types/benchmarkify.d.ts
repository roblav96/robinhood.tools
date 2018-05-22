// 

declare module 'benchmarkify' {

	namespace Benchmarkify {
		interface Options {
			logger: Console
			minSamples: number
			spinner: boolean
		}
		interface SuiteOptions {
			minSamples: number
			name: string
			time: number
		}
		interface TestCaseOptions {
			cycles: number
			minSamples: number
			time: number
		}
		interface Result {
			fastest: boolean
			name: string
			stat: {
				avg: number
				count: number
				cycle: number
				duration: number
				percent: number
				rps: number
			}
		}
		class Suite {
			constructor(parent: Benchmarkify, name: string, opts: SuiteOptions)
			add(name: string, fn: (done?: () => void) => void): this
			only(name: string, fn: (done?: () => void) => void): this
			ref(name: string, fn: (done?: () => void) => void): this
			skip(name: string, fn: (done?: () => void) => void): this
			run(): Promise<Result[]>
		}
	}
	class Benchmarkify {
		constructor(name: string, opts: Benchmarkify.Options)
		createSuite(name: string, opts: Benchmarkify.SuiteOptions): Benchmarkify.Suite
		printHeader(platformInfo?: boolean): this
		printPlatformInfo(): void
		run(suites: Benchmarkify.Suite[]): Promise<Benchmarkify.Result[]>
	}
	export = Benchmarkify

}


