// 

export * from '../../common/security'
import * as http from 'http'
import * as url from 'url'
import * as boom from 'boom'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as security from '../../common/security'
import * as redis from '../adapters/redis'
import { PolkaRequest } from '../api/polka.request'



export function isDoc(
	doc: Security.Doc,
	required = ['ip', 'uuid', 'finger', 'hostname', 'useragent'] as KeysOf<Security.Doc>,
) {
	let i: number, len = required.length
	for (i = 0; i < len; i++) {
		let key = required[i]
		let value = doc[key]
		if (!value || typeof value != 'string') {
			return key
		}
	}

	if (security.LENGTHS.finger != doc.finger.length) return 'finger.length';
	if (doc.token && security.LENGTHS.token != doc.token.length) return 'token.length';
	if (doc.bits && security.LENGTHS.bits != doc.bits.length) return 'bits.length';

	let split = doc.uuid.split('.')
	doc.uuid = split[0]
	if (security.LENGTHS.uuid != doc.uuid.length) return 'uuid.length';

	let stamp = split[1]
	if (isNaN(stamp as any)) return 'stamp';
	doc.stamp = Number.parseInt(stamp)
	if (Math.abs(Date.now() - doc.stamp) > 60000) {
		return 'stamp'
	}

}

export async function reqDoc(req: PolkaRequest, rhdoc = false): Promise<any> {
	let rkey = `${rkeys.SECURITY.DOC}:${req.doc.uuid}`
	let prime = await redis.main.hget(rkey, 'prime')
	if (prime) {
		req.authed = req.doc.token == token(req.doc, prime)
		if (!req.authed) throw boom.unauthorized('doc.token != req.token');
	}
	if (rhdoc) {
		let ikeys = ['rhusername', 'rhaccount', 'rhtoken'] as KeysOf<Security.Doc>
		let rdoc = await redis.main.hmget(rkey, ...ikeys) as Security.Doc
		rdoc = redis.fixHmget(rdoc, ikeys)
		if (Object.keys(rdoc).length != ikeys.length) return;
		Object.assign(req.doc, rdoc)
	}
}

export function token(doc: Security.Doc, prime: string) {
	return security.hmac256(doc.uuid + doc.finger + doc.bits + doc.useragent + doc.hostname, prime)
}

export function ip(headers: Dict<string>) {
	return headers['x-forwarded-for'] || headers['x-real-ip']
}



