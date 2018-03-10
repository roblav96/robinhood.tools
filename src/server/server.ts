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
import * as got from 'got'
import * as ffastify from 'fastify'
import * as cors from 'cors'
import r from './adapters/rethinkdb'
import redis from './adapters/redis'



const fastify = ffastify()

fastify.use(cors())



fastify.route({
	method: 'POST',
	url: '/api/robinhood/login',
	schema: {
		body: {
			type: 'object',
			properties: {
				username: { type: 'string' },
				password: { type: 'string' },
			},
		},
		response: {
			200: {
				type: 'object',
				properties: {
					hello: { type: 'string' },
				},
			},
		},
	},
	handler: async function(request, reply) {
		console.log('request >')
		eyes.inspect(request)
		return reply.send({ hello: 'world' })
	},
})



fastify.route({
	method: 'POST',
	url: '/api/recaptcha/verify',
	schema: {
		body: {
			type: 'object',
			properties: {
				response: { type: 'string' },
			},
		},
		response: {
			200: {
				type: 'object',
				properties: {
					success: { type: 'boolean' },
				},
			},
		},
	},
	handler: async function(request, reply) {
		request.body.secret = process.env.RECAPTCHA_SECRET
		console.log('request.body >')
		eyes.inspect(request.body)
		return got.post('https://www.google.com/recaptcha/api/siteverify', {
			query: request.body, json: true,
		}).then(function({ body }) {
			console.log('body >')
			eyes.inspect(body)
			// if (body['error-codes'].length > 0) {
			// 	throw JSON.stringify(body['error-codes'])
			// }
			return reply.send({ success: body.success })
		})
	},
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
		if (error) console.error('fastify.listen > error', error);
		// else console.log('fastify ready >', port);
	})

}




