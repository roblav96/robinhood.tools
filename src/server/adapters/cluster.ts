// 

import * as _ from 'lodash'
import * as cluster from 'cluster'
import * as core from '../../common/core'
import radio from './radio'



if (process.MASTER && process.INSTANCES > 0) {
	radio.open.subscribe(function subscribe() {

		const workers = {} as Dict<number>
		function fork(i: number) {
			let worker = cluster.fork({ INSTANCE: i })
			workers[worker.process.pid] = i
		}

		console.info('Forking', process.INSTANCES, 'workers in cluster...')
		let i: number, len = process.INSTANCES
		for (i = 0; i < len; i++) { fork(i) }

		// cluster.on('online', function(worker) { console.info('worker', workers[worker.process.pid], 'online') })
		cluster.on('exit', function(worker, code, signal) {
			let i = workers[worker.process.pid]
			console.error('worker', i, 'exit ->', 'id:', worker.id, '| pid:', worker.process.pid, '| code:', code, '| signal:', signal)
			let ms = core.math.dispersed(5000, i, process.INSTANCES)
			_.delay(fork, ms, i)
		})

	})
}


