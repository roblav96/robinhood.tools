// 
import './_process'
// 

import chalk from 'chalk'
import * as util from 'util'
import * as _ from 'lodash'
import * as core from '../common/core'
import * as cluster from 'cluster'



if (DEVELOPMENT) process.INSTANCES = 1;

if (process.MASTER) {

	console.log('Forking ' + chalk.bold('x' + chalk.red(process.INSTANCES)) + ' workers in cluster...')
	const workers = {} as Dict<number>
	let i: number, len = process.INSTANCES
	for (i = 0; i < len; i++) {
		let worker = cluster.fork({ WORKER_INSTANCE: i })
		workers[worker.process.pid] = i
	}
	// cluster.on('online', function(worker) { console.info('worker', workers[worker.process.pid], 'online') })
	cluster.on('exit', function(worker, code, signal) {
		let i = workers[worker.process.pid]
		console.error('worker', i, 'exit ->', 'id:', worker.id, '| pid:', worker.process.pid, '| code:', code, '| signal:', signal)
		_.delay(function(i: number) {
			let worker = cluster.fork({ WORKER_INSTANCE: i })
			workers[worker.process.pid] = i
		}, 5000, i)
	})

}



global.WebSocket = require('uws')

import '../common/ticks'
import './services/devtools'
import './services/radio'

if (process.WORKER) {
	require('./api/fastify')
	// import('./api/fastify').catch(error => console.error('import(./api/fastify) Error ->', error))
}


