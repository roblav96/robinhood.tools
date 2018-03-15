// 

require('source-map-support').install()
require('./process')

// 

import chalk from 'chalk'
import * as eyes from 'eyes'

import * as os from 'os'
import * as cluster from 'cluster'
import * as url from 'url'
import * as moment from 'moment'



if (process.MASTER) {

	console.log('\n' +
		'█ ' + chalk.underline.magenta(process.DNAME) + '\n' +
		'█ ' + NODE_ENV + '\n' +
		'█ ' + process.HOST + ':' + process.PORT
	)

	process.EE3.once('RESTART', function() {
		console.warn('RESTART')
		process.nextTick(() => process.exit(1))
	})
	// process.RADIO.once('RESTART', restart)

	console.log('Forking ' + chalk.bold('x' + chalk.redBright(process.INSTANCES.toString())) + ' nodes in cluster...')
	let i: number, len = process.INSTANCES
	for (i = 0; i < len; i++) { cluster.fork() }
	cluster.on('disconnect', function(worker) {
		console.warn('cluster disconnect >', worker.id)
		// process.RADIO.emit('RESTART')
	})
	cluster.on('exit', function(worker, code, signal) {
		console.error('cluster exit >', worker.id, code, signal)
		// process.RADIO.emit('RESTART')
	})

} else {
	require('./fastify')
	// require('./adapters/gun')
	require('./adapters/wss')
	require('./adapters/webull')
}


