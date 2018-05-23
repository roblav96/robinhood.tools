// 

import * as Benchmarkify from 'benchmarkify'



export function simple(name: string, fns: (() => void)[]) {
	let benchmark = new Benchmarkify('Benchmark Simple').printHeader()
	let suite = benchmark.createSuite(name, { time: 3000 })
	fns.forEach(fn => suite.add(fn.name, fn))
	suite.run()
}


