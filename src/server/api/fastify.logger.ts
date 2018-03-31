// 

import * as eyes from 'eyes'
import * as fs from 'fs'
import * as _ from 'lodash'
import * as Pino from 'pino'
import * as core from '../../common/core'
import fastify from './fastify'



const reqs = [] as Pino.LogRequest[]
const recycle = _.throttle(function(reqId: number) {
	reqs.splice(0, reqId)
}, 1000, { leading: false, trailing: true })

export default Object.assign(fs.createWriteStream('/dev/null'), {

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

		let method = console[log.label] ? log.label : 'error'
		let message = (method == 'info' && !log.req && !log.res && !log.err) ? log.msg : log
		console[method](log.label.toUpperCase(), '->', message) // eyes.inspect(message))

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
	interface LogError extends Error {

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


