// 

import * as _ from 'lodash'
import * as cluster from 'cluster'
import * as core from '../../common/core'
import * as pretty from '../../common/pretty'
import fastify from '../api/fastify'



const workers = {} as Dict<number>
function fork(i: number) {
	let worker = cluster.fork({ NODE_APP_INSTANCE: i })
	workers[worker.process.pid] = i
}

function onsubscribe() {

	let forks = process.INSTANCES - 1
	console.info('Forking', forks, pretty.plural('worker', forks), 'in cluster...')

	const INSTANCE = 1
	let i: number, len = process.INSTANCES
	for (i = INSTANCE; i < len; i++) { fork(i) }

	cluster.on('online', function(worker) { console.info('worker', workers[worker.process.pid], 'online') })
	cluster.on('exit', function(worker, code, signal) {
		let i = workers[worker.process.pid]
		console.error('worker', i, 'exit ->', 'id:', worker.id, '| pid:', worker.process.pid, '| code:', code, '| signal:', signal)
		let ms = core.math.dispersed(3000, i, process.INSTANCES)
		_.delay(fork, ms, i)
	})

}

if (process.MASTER) {
	fastify.rxready.subscribe(onsubscribe)
}


