// 

import { isBrowser, isNodeJS } from './core'
if (isBrowser) process.hrtime = require('browser-process-hrtime');
import * as Benchmarkify from 'benchmarkify'



export function simple(name: string, fns: (() => void)[]) {
	let benchmark = new Benchmarkify('Benchmark Simple', { spinner: !isBrowser })
	// if (isNodeJS) benchmark.printHeader();
	let suite = benchmark.createSuite(name, { time: 3000 })
	fns.forEach(fn => suite.add(fn.name, fn))
	return suite.run()//.then(results => console.log(`Suite '${name}' results ->`, results))
}


