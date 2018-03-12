// 

require('source-map-support').install()
// global.Promise = require('bluebird')
require('./process')
// require('./radio')

// 

import * as eyes from 'eyes'
import * as clc from 'cli-color'

import * as os from 'os'
import * as cluster from 'cluster'
import * as url from 'url'
import * as moment from 'moment'



if (process.MASTER) {

	let host = url.parse(process.env.DOMAIN).host
	if (DEVELOPMENT) host = process.env.HOST + ':' + process.env.PORT;
	console.log('\n \n' +
		clc.bold.underline.magenta(process.env.DNAME) + '\n' +
		'v' + process.env.VERSION + ' ' +
		clc.bold(NODE_ENV) + '\n' +
		host + '\n' +
		'/*===============================================\n' +
		'=========           ' + clc.bold(moment().format('hh:mm:ss')) + '           ==========\n' +
		'===============================================*/'
	)

	process.EE3.once('RESTART', function() {
		console.warn('RESTART')
		process.nextTick(() => process.exit(1))
	})
	// process.RADIO.once('RESTART', restart)

	console.log(clc.bold('Forking x' + clc.bold.redBright(process.INSTANCES) + ' nodes in cluster...'))
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


