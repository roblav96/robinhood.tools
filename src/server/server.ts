// 

require('source-map-support').install()
require('./process')
// require('./radio')

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



const fastify = ffastify()



fastify.get('/', function(request, reply) {
	reply.send({ hello: 'world' })
})





if (MASTER) {

	let host = url.parse(DOMAIN).host
	if (DEVELOPMENT) host = process.env.HOST + ':' + process.env.PORT;
	console.log('\n \n' +
		clc.bold.underline.magenta(process.env.DNAME) + '\n' +
		'v' + VERSION + ' ' +
		clc.bold(NODE_ENV) + '\n' +
		host + '\n' +
		'/*===============================================\n' +
		'=========           ' + clc.bold(moment().format('hh:mm:ss')) + '           ==========\n' +
		'===============================================*/'
	)

	const restart = _.once(function() {
		console.warn('RESTART')
		process.nextTick(() => process.exit(1))
	})
	EE3.once('RESTART', restart)
	// process.RADIO.once('RESTART', restart)

	console.log(clc.bold('Forking x' + clc.bold.redBright(INSTANCES) + ' nodes in cluster...'))
	let i: number, len = INSTANCES
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

	let port = Number.parseInt(process.env.PORT) + INSTANCE
	fastify.listen(port, process.env.HOST, function(error) {
		if (error) {
			console.error('fastify.listen > error', error)
			throw error
		}
		console.log('fastify ready >', port)
	})

}



