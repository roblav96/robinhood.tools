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
	let split = doc.uuid.split('.')
	doc.uuid = split[0]
	let stamp = split[1]
	if (isNaN(stamp as any)) return 'stamp';
	doc.stamp = Number.parseInt(stamp)
	if (Math.abs(Date.now() - doc.stamp) > 60000) {
		return 'stamp'
	}
}

export function reqDoc(req: PolkaRequest) {
	let ikeys = ['prime', 'ishuman', 'rhusername', 'rhtoken'] as KeysOf<Security.Doc>
	return redis.main.hmget(`${rkeys.SECURITY.DOC}:${req.doc.uuid}`, ...ikeys).then(function(rdoc: Security.Doc) {
		rdoc = redis.fixHmget(rdoc, ikeys)
		if (rdoc.prime) req.authed = req.doc.token == token(req.doc, rdoc.prime);
		if (rdoc.rhusername) req.doc.rhusername = rdoc.rhusername;
		if (rdoc.rhtoken) req.doc.rhtoken = rdoc.rhtoken;
		req.doc.ishuman = !!rdoc.ishuman
	}) as Promise<any>
}

export function token(doc: Security.Doc, prime: string) {
	return security.hmac256(doc.uuid + doc.finger + doc.bits + doc.useragent + doc.hostname, prime)
}

export function ip(headers: Dict<string>) {
	return headers['x-forwarded-for'] || headers['x-real-ip']
}



