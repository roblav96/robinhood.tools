//

import * as core from './core'
import * as Benchmarkify from 'benchmarkify'
export { Benchmarkify }

export default function benchmark(name: string, fns: ((done?: () => void) => void)[]) {
	let benchmark = new Benchmarkify('Benchmark Simple', { spinner: !core.isBrowser })
	let suite = benchmark.createSuite(name, { time: 3000 })
	fns.forEach((fn) => {
		let name =
			fn.name ||
			fn
				.toString()
				.replace(/[^a-z ]+/g, '')
				.replace(/\s+/g, ' ')
				.trim()
		return suite.add(name, fn)
	})
	setTimeout(() => suite.run(), 1000)
}
