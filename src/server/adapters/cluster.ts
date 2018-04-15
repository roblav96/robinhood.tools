// 

import * as clc from 'cli-color'
import * as _ from '../../common/lodash'
import * as R from '../../common/rambdax'
import * as Rx from '../../common/rxjs'
import * as cluster from 'cluster'
import * as core from '../../common/core'
import * as pretty from '../../common/pretty'
import clock from '../../common/clock'
import fastify from '../api/fastify'



const workers = {} as Dict<number>
function fork(i: number) {
	let worker = cluster.fork({ NODE_APP_INSTANCE: i })
	workers[worker.process.pid] = i
}

function onforking() {

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

if (cluster.isMaster) {
	fastify.rxready.subscribe(onforking)

	if (DEVELOPMENT) {
		clock.on('1s', function(i) {
			let direction = (i % 2 == 0) ? 'left' : 'right' 
			process.stdout.write(clc.move[direction](1))
		})
	}

}


