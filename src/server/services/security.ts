// 

export * from '../../common/security'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as security from '../../common/security'
import * as redis from '../adapters/redis'
import * as boom from 'boom'
import * as http from 'http'



export async function authorize(
	{ doc, keys, required, referer, origin }: {
		doc: Security.Doc
		keys: string[]
		required?: string[]
		referer?: string
		origin?: string
	},
	useboom = true,
) {
	let authed = false

	required = (required || []).concat(['x-uuid', 'x-finger', 'user-agent', 'hostname', 'x-forwarded-for', 'x-real-ip'])
	let missing = _.difference(required, keys)
	if (missing.length > 0) {
		if (!useboom) return authed;
		throw boom.preconditionFailed('Missing security headers' + (DEVELOPMENT ? (': ' + JSON.stringify(missing)) : ''))
	}

	if ((referer || origin).indexOf(process.DOMAIN) != 0) {
		if (!useboom) return authed;
		let which = Object.keys(core.object.compact({ referer, origin }, true))[0]
		throw boom.preconditionFailed('Invalid security header' + (DEVELOPMENT ? ': "' + which + '"' : ''))
	}

	let split = doc.finger.split('.')
	if (split.length != 2) {
		if (!useboom) return authed;
		throw boom.preconditionFailed('Invalid security header' + (DEVELOPMENT ? ': "x-finger"' : ''))
	}
	doc.finger = split[0]
	if (Math.abs(Date.now() - Number.parseInt(split[1])) > 10000) {
		if (!useboom) return authed;
		throw boom.preconditionFailed('Expired security header' + (DEVELOPMENT ? ': "x-finger"' : ''))
	}

	if (doc.token) {
		let prime = await redis.main.hget('security:doc:' + doc.uuid, 'prime')
		if (prime) authed = doc.token == generateToken(doc, prime);
	}

	return authed

}



export function generateToken(doc: Security.Doc, prime: string) {
	return security.hmac256(doc.uuid + doc.finger + doc.bytes + doc.useragent + doc.hostname, prime)
}

export function getip(req: http.IncomingMessage) {
	let headers = req.headers as Dict<string>
	return headers['x-forwarded-for'] || headers['x-real-ip'] || req.connection.remoteAddress || req.socket.remoteAddress
}



