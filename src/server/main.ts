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

	let host = url.parse(process.env.DOMAIN).host
	if (DEVELOPMENT) host = process.env.HOST + ':' + process.env.PORT;
	console.log('\n \n' +
		chalk.bold.underline.magenta(process.env.DNAME) + '\n' +
		'v' + process.env.VERSION + ' ' +
		chalk.bold(NODE_ENV) + '\n' +
		host + '\n' +
		'/*===============================================\n' +
		'=========           ' + chalk.bold(moment().format('hh:mm:ss')) + '           ==========\n' +
		'===============================================*/'
	)

	process.EE3.once('RESTART', function() {
		console.warn('RESTART')
		process.nextTick(() => process.exit(1))
	})
	// process.RADIO.once('RESTART', restart)

	// if (DEVELOPMENT) process.INSTANCES = 1;

	console.log(chalk.bold('Forking x' + chalk.bold.redBright(process.INSTANCES.toString()) + ' nodes in cluster...'))
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
	require('./server')
}


