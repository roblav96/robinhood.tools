// 

import * as cluster from 'cluster'



if (process.MASTER && process.INSTANCES > 0) {

	const workers = {} as Dict<number>
	const fork = function fork(i: number) {
		let worker = cluster.fork({ INSTANCE: i })
		workers[worker.process.pid] = i
	}

	console.log('Forking', process.INSTANCES, 'workers in cluster...')
	let i: number, len = process.INSTANCES
	for (i = 0; i < len; i++) { fork(i) }

	// cluster.on('online', function(worker) { console.info('worker', workers[worker.process.pid], 'online') })
	cluster.on('exit', function(worker, code, signal) {
		let i = workers[worker.process.pid]
		console.error('worker', i, 'exit ->', 'id:', worker.id, '| pid:', worker.process.pid, '| code:', code, '| signal:', signal)
		setTimeout(fork, 3000, i)
	})

}


