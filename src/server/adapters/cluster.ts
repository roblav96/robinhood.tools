// 

import * as _ from '../../common/lodash'
import * as cluster from 'cluster'
import * as core from '../../common/core'
import * as pretty from '../../common/pretty'
import * as R from '../../common/rambdax'
import fastify from '../api/fastify'



const workers = {} as Dict<number>
function fork(i: number) {
	let worker = cluster.fork({ NODE_APP_INSTANCE: i })
	workers[worker.process.pid] = i
}

function onsubscribe() {

	let forks = process.INSTANCES - 1
	console.info('Forking', `+${forks}`, pretty.plural('worker', forks), 'in cluster...')

	const INSTANCE = 1
	let i: number, len = process.INSTANCES
	for (i = INSTANCE; i < len; i++) { fork(i) }

	// cluster.on('online', function(worker) { console.info('worker', workers[worker.process.pid], 'online') })
	cluster.on('exit', function(worker, code, signal) {
		let i = workers[worker.process.pid]
		console.error('worker', i, 'exit ->', 'ID:', worker.id, 'PID:', worker.process.pid, 'CODE:', code, 'SIGNAL:', signal)
		let ms = core.math.dispersed(3000, i, process.INSTANCES)
		_.delay(fork, ms, i)
	})

}

if (process.MASTER) {
	fastify.rxready.subscribe(onsubscribe)
}


