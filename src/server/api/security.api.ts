// 

import { CookieSerializeOptions } from 'cookie'
import * as _ from '../../common/lodash'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as security from '../adapters/security'
import polka from './polka'



polka.route({
	method: 'GET',
	url: '/api/security/token',
	async handler(req, res) {
		let prime = security.randomBits(32)

		let ikeys = ['ishuman', 'rhusername'] as KeysOf<Security.Doc>
		let rkey = `${rkeys.SECURITY.DOC}:${req.doc.uuid}`
		let resolved = await redis.main.coms([
			['hmget', rkey].concat(ikeys),
			['hset', rkey, 'prime', prime],
		])
		let rdoc = redis.fixHmget(resolved[0], ikeys) as Security.Doc
		rdoc.ishuman = !!rdoc.ishuman

		let cookie = {
			domain: process.env.DOMAIN,
			path: '/', sameSite: true, httpOnly: true,
			secure: !!process.env.PRODUCTION,
		} as CookieSerializeOptions
		req.doc.bits = security.randomBits(32)
		res.setCookie('x-bits', req.doc.bits, cookie)
		let token = security.token(req.doc, prime)
		res.setCookie('x-token', token, cookie)

		return rdoc
	}
})
