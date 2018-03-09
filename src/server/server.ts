// 

require('source-map-support').install()
global.Promise = require('bluebird')
import './process'
// import './radio'

// 

import * as eyes from 'eyes'
import * as clc from 'cli-color'
import * as _ from 'lodash'

import * as os from 'os'
import * as cluster from 'cluster'
import * as url from 'url'
import * as moment from 'moment'
import * as ffastify from 'fastify'
import r from './adapters/rethinkdb'
import redis from './adapters/redis'



if (process.MASTER) {

	let host = url.parse(process.DOMAIN).host
	if (process.DEVELOPMENT) host = process.HOST + ':' + process.PORT;
	console.log('\n \n' +
		clc.bold.underline.magenta('𝛂CoinTrader') + '\n' +
		'v' + process.VERSION + ' ' +
		clc.bold(process.ENV) + '\n' +
		host + '\n' +
		'/*===============================================\n' +
		'=========           ' + clc.bold(moment().format('hh:mm:ss')) + '           ==========\n' +
		'===============================================*/'
	)

	const restart = _.once(function() {
		console.warn('RESTART')
		process.nextTick(() => process.exit(1))
	})
	process.EE3.once('RESTART', restart)
	// process.RADIO.once('RESTART', restart)

	// console.log(clc.bold('Forking x' + clc.bold.redBright(process.INSTANCES) + ' nodes in cluster...'))
	// let i: number, len = process.INSTANCES
	// for (i = 0; i < len; i++) { cluster.fork() }
	// cluster.on('disconnect', function(worker) {
	// 	console.warn('cluster disconnect >', worker.id)
	// 	process.RADIO.emit('RESTART')
	// })
	// cluster.on('exit', function(worker, code, signal) {
	// 	console.error('cluster exit >', worker.id, code, signal)
	// 	process.RADIO.emit('RESTART')
	// })

}



const fastify = ffastify()

fastify.listen(process.PORT, process.HOST, function(error) {
	if (error) {
		console.error('fastify.listen > error', error)
		throw error
	}
	console.log('fastify ready')
})




