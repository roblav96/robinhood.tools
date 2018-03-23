// 
import './_process'
// if (DEVELOPMENT) process.INSTANCES = 1;
process.INSTANCES = 1
// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as cluster from 'cluster'



if (process.MASTER) {

	console.log('Forking ' + chalk.bold('x' + chalk.red(process.INSTANCES)) + ' nodes in cluster...')
	let i: number, len = process.INSTANCES
	for (i = 0; i < len; i++) { cluster.fork() }
	cluster.on('disconnect', function(worker) {
		console.warn('cluster disconnect >', worker.id)
	})
	cluster.on('exit', function(worker, code, signal) {
		console.error('cluster exit Error >', worker.id, code, signal)
	})

} else {
	import('./fastify')
}


