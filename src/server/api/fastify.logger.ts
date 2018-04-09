// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as util from 'util'
import * as fs from 'fs'
import * as _ from '../../common/lodash'
import * as Fastify from 'fastify'
import * as Pino from 'pino'
import * as core from '../../common/core'
import fastify from './fastify'



const reqs = [] as Pino.LogRequest[]
const recycle = _.throttle(function(reqId: number) {
	reqs.splice(0, reqId)
}, 1000, { leading: false, trailing: true })

export default Object.assign(fs.createWriteStream('/dev/null'), {

	inspector(value: any) { return !chalk.supportsColor ? util.inspect(value) : eyes.inspect(value) },

	write(log: Pino.LogDescriptor) {
		if (!core.json.is(log)) {
			return console.error('log not parsable ->', log)
		}
		log = JSON.parse(log as any)
		log.label = Pino.levels.labels[log.level]

		if (DEVELOPMENT) {
			if (log.req) reqs[log.reqId] = log.req;
			else if (reqs[log.reqId]) {
				log.req = reqs[log.reqId]
				recycle(log.reqId)
			}
		}

		let message = _.omit(log, ['level', 'time', 'pid', 'hostname', 'v', 'label', 'reqId', 'responseTime'])
		if (message.req) message.req = _.omit(message.req, ['id', 'remoteAddress', 'remotePort']) as any;

		if (log.err && log.err.stack) {
			if (log.err.isGot) {
				return console.error('ERROR ->', this.inspector(_.omit(message, ['err.stack'])))
			}
			return console.error(
				'ERROR ->', message.err.stack, '\n',
				this.inspector(_.omit(message, ['err.stack']))
			)
		}

		let fn = console[log.label] ? log.label : 'error'
		console[fn](
			log.label.toUpperCase(), '->',
			fastify.log.level == 'debug' ? message : this.inspector(message)
		)

	}
})





import { Writable, Duplex, Transform } from 'stream'
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
	interface LogError extends Fastify.FastifyError {

	}
	interface LogDescriptor {
		label?: string
		reqId?: number
		responseTime?: number
		req?: LogRequest
		res?: LogResponse
		err?: LogError
	}
	interface LoggerOptions {
		stream?: Writable | Duplex | Transform
	}
}


