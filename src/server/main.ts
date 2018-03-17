// 
import './__process'
if (DEVELOPMENT) process.INSTANCES = 1;
// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as cluster from 'cluster'



if (process.MASTER) {

	process.EE3.once('RESTART', function() {
		console.warn('RESTART')
		process.nextTick(() => process.exit(1))
	})
	// process.RADIO.once('RESTART', restart)

	console.log('Forking ' + chalk.bold('x' + chalk.redBright(process.INSTANCES)) + ' nodes in cluster...')
	let i: number, len = process.INSTANCES
	for (i = 0; i < len; i++) { cluster.fork() }
	cluster.on('disconnect', function(worker) {
		console.warn('cluster disconnect >', worker.id)
		// process.RADIO.emit('RESTART')
	})
	cluster.on('exit', function(worker, code, signal) {
		console.error('cluster exit Error >', worker.id, code, signal)
		// process.RADIO.emit('RESTART')
	})

} else {
	import('./fastify')
	// require('./fastify')
	// // require('./adapters/gun')
	// require('./adapters/wss')
	// require('./adapters/webull')
}


