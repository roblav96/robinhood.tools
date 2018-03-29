// 
import '../common/polyfills'
import 'source-map-support/register'
import './_process'
import '../common/logger'
// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../common/core'
import * as pretty from '../common/pretty'
import * as cluster from 'cluster'



if (DEVELOPMENT) process.INSTANCES = 0;

if (process.MASTER && process.INSTANCES > 0) {

	let xis = 'x' + chalk.red(process.INSTANCES)
	let word = chalk.red(core.number.word(process.INSTANCES).toUpperCase())
	let plural = pretty.plural('worker', process.INSTANCES)
	console.log(`Forking ${chalk.bold(xis + ' (' + word + ')')} ${plural} in cluster...`)

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
}


