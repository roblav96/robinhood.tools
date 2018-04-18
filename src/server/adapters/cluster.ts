// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as pretty from '../../common/pretty'
import * as cluster from 'cluster'



if (cluster.isMaster) {

	const workers = {} as Dict<number>
	function fork(id: number) {
		let worker = cluster.fork({ NODE_APP_INSTANCE: id })
		workers[worker.process.pid] = id
	}

	let forks = process.INSTANCES - 1
	console.info('Forking', `+${forks}`, 'additional', pretty.plural('worker', forks), 'in cluster...')

	const INSTANCE = 1
	let i: number, len = process.INSTANCES
	for (i = INSTANCE; i < len; i++) {
		let ms = core.math.dispersed(100 * process.INSTANCES, i, process.INSTANCES)
		_.delay(fork, ms, i)
	}

	// cluster.on('online', function(worker) { console.info('worker', workers[worker.process.pid], 'online') })
	cluster.on('exit', function(worker, code, signal) {
		let id = workers[worker.process.pid]
		console.error(id, 'worker exit ->', 'id', worker.id, 'pid', worker.process.pid, 'code', code, 'signal', signal)
		let ms = core.math.dispersed(3000, id, process.INSTANCES)
		_.delay(fork, ms, id)
	})

}


