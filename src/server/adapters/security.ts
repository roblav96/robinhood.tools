// 

export * from '../../common/security'
import * as boom from 'boom'
import * as rkeys from '../../common/rkeys'
import * as security from '../../common/security'
import * as redis from '../adapters/redis'
import { PolkaRequest } from '../api/polka.request'



export function isDoc(
	doc: Security.Doc,
	required = ['ip', 'uuid', 'finger', 'useragent'] as KeysOf<Security.Doc>,
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
	doc.rkey = `${rkeys.SECURITY.DOC}:${doc.uuid}`
	if (security.LENGTHS.uuid != doc.uuid.length) return 'uuid.length';

	let stamp = split[1]
	if (isNaN(stamp as any)) return 'stamp';
	doc.stamp = Number.parseInt(stamp)
	if (Math.abs(Date.now() - doc.stamp) > 60000) {
		return 'stamp'
	}

}

export async function reqDoc(req: PolkaRequest, rhdoc = false): Promise<any> {
	let prime = await redis.main.hget(req.doc.rkey, 'prime')
	if (prime) {
		req.authed = req.doc.token == token(req.doc, prime)
		if (!req.authed) {
			await redis.main.hdel(req.doc.rkey, 'prime')
			let message = 'doc.token != req.token'
			if (process.env.DEVELOPMENT) {
				throw new boom(message, { message, statusCode: 401, data: { doc: req.doc } })
			}
			throw boom.unauthorized(message)
		}
	}
	if (rhdoc && req.authed) {
		let ikeys = ['rhusername', 'rhtoken'] as KeysOf<Security.Doc>
		let rdoc = await redis.main.hmget(req.doc.rkey, ...ikeys) as Security.Doc
		rdoc = redis.fixHmget(rdoc, ikeys)
		if (Object.keys(rdoc).length != ikeys.length) return;
		Object.assign(req.doc, rdoc)
	}
}

export function token(doc: Security.Doc, prime: string) {
	return security.hmac256(doc.uuid + doc.finger + doc.bits + doc.useragent, prime)
}

export function ip(headers: Dict<string>) {
	return headers['x-forwarded-for'] || headers['x-real-ip']
}



