// 
if (process.MASTER) { console.error('fastify -> process.MASTER should not import fastify', '\n'); process.exit(1) }
// 

import * as fs from 'fs'
import * as _ from 'lodash'
import * as Fastify from 'fastify'
import * as Pino from 'pino'
import * as core from '../../common/core'
import * as devtools from '../services/devtools'



const LOG_LEVEL = 'debug' as Pino.Level

const fastify = Fastify({
	logger: {
		level: LOG_LEVEL, extreme: PRODUCTION,
		stream: Object.assign(fs.createWriteStream('/dev/null'), {

			reqs: {} as Dict<Pino.LogRequest>,

			write(log: Pino.LogDescriptor) {
				if (!core.json.is(log)) {
					return console.error('log not parsable ->', log)
				}
				log = JSON.parse(log as any)
				log.label = fastify.log.levels.labels[log.level]

				if (DEVELOPMENT) {
					if (log.req) this.reqs[log.reqId] = log.req;
					if (log.res && this.reqs[log.reqId]) {
						log.req = this.reqs[log.reqId]
						_.unset(this.reqs, log.reqId)
					}
				}
				
				process.dtsgen('log', log)

				let method = console[log.label] ? log.label : 'error'
				console[method](log.label.toUpperCase(), '->', log)

			},

		}),
	},
})

export default fastify

import './fastify.errors'
import './fastify.plugins'



import radio from '../adapters/radio'
fastify.register(function(fastify, opts, next) {
	radio.once('_onready_', next)
})



import './security.hook'
import './security.api'

import './logger.api'
import './socket.api'
import './proxy.api'
import './recaptcha.api'
import './search.api'



fastify.listen(process.PORT + process.INSTANCE, process.HOST, function(error) {
	if (error) return console.error('listen Error ->', error);
	if (process.PRIMARY) console.info('listen ->', fastify.server.address().address + ':' + fastify.server.address().port, '\n', fastify.printRoutes());
})





declare module 'fastify' {
	interface FastifyRequest<HttpRequest> {
		authed: boolean
		ip: string
		doc: Security.Doc
	}
	interface FastifyReply<HttpResponse> {

	}
}

import * as stream from 'stream'
declare module 'pino' {
	interface LogRequest {
		id: number,
		method: string
		url: string
		remoteAddress: string
		remotePort: number
	}
	interface LogResponse {
		statusCode: number
	}
	interface LogDescriptor {
		label?: string
		reqId?: number
		responseTime?: number
		req?: LogRequest
		res?: LogResponse
		err?: any
		error?: Error
	}
	interface LoggerOptions {
		stream?: stream.Writable | stream.Duplex | stream.Transform
	}
}


