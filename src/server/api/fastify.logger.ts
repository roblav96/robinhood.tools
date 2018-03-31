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

		let message = _.omit(log, ['level', 'time', 'pid', 'hostname', 'v', 'label', 'reqId', 'responseTime'])
		if (message.req) message.req = _.omit(message.req, ['id', 'remoteAddress', 'remotePort']) as any;

		let fn = console[log.label] ? log.label : 'error'
		if (fastify.log.level == 'debug') console[fn](log.label.toUpperCase(), '->', message);
		else console[fn](eyes.inspect(message));


		// let message = log as any
		// let msg = log.msg
		// let label = log.label.toUpperCase()
		// if (label == 'INFO') {
		// 	// if (msg.indexOf('Server listening') == 0) return;
		// 	if (msg.indexOf('Server listening') == 0) message = msg;
		// 	// if (msg == 'incoming request') message = `-> [${log.req.method}] ${log.req.url}`;
		// 	if (msg == 'incoming request') {
		// 		message = _.pick(log, ['msg', 'req'])
		// 	}
		// 	// if (msg == 'request completed') message = `<- [${log.req.method}] ${log.req.url}`;
		// }

		// let fn = console[log.label] ? log.label : 'error'
		// if (label == 'INFO' && core.string.is(message)) {
		// 	console[fn](message)
		// } else {
		// 	console[fn](label, '->', eyes.inspect(message))
		// }

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


