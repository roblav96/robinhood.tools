// 
export * from '../../common/security'
// 

import * as http from 'http'
import * as url from 'url'
import * as boom from 'boom'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as security from '../../common/security'
import * as redis from '../adapters/redis'



export async function authorize(
	{ doc, keys, required, referer, origin }: {
		doc: Security.Doc
		keys: string[]
		required?: string[]
		referer?: string
		origin?: string
	},
) {

	let authed = false

	required = (required || []).concat(['x-uuid', 'x-finger', 'user-agent', 'hostname', 'x-forwarded-for', 'x-real-ip'])
	let missing = _.difference(required, keys)
	if (missing.length > 0) {
		throw boom.preconditionRequired('Missing security headers' + (process.env.DEVELOPMENT ? `: '${missing}'` : ''))
	}

	let host = url.parse(referer || origin).host
	if (!host || host.indexOf(process.env.DOMAIN) != 0) {
		let which = Object.keys(core.object.compact({ referer, origin }, true))[0]
		throw boom.preconditionFailed('Invalid security header' + (process.env.DEVELOPMENT ? `: '${which}'` : ''))
	}

	let split = doc.finger.split('.')
	if (split.length != 2) {
		throw boom.preconditionFailed('Invalid security header' + (process.env.DEVELOPMENT ? `: 'x-finger'` : ''))
	}
	doc.finger = split[0]
	if (Math.abs(Date.now() - Number.parseInt(split[1])) > 60000) {
		throw boom.preconditionFailed('Expired security header' + (process.env.DEVELOPMENT ? `: 'x-finger'` : ''))
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

export function reqip(req): string {
	return req.headers['x-forwarded-for'] || req.headers['x-real-ip']
}



