// 

import { CookieSerializeOptions } from 'cookie'
import * as _ from '../../common/lodash'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as security from '../adapters/security'
import * as robinhood from '../adapters/robinhood'
import polka from './polka'



polka.route({
	method: 'GET',
	url: '/api/security/token',
	async handler(req, res) {
		let prime = security.randomBits(32)

		let ikeys = ['ishuman', 'rhusername', 'rhtoken'] as KeysOf<Security.Doc>
		let rkey = `${rkeys.SECURITY.DOC}:${req.doc.uuid}`
		let resolved = await redis.main.coms([
			['hmget', rkey].concat(ikeys),
			['hset', rkey, 'prime', prime],
		])
		let rdoc = redis.fixHmget(resolved[0], ikeys) as Security.Doc

		let cookie = {
			domain: process.env.DOMAIN,
			path: '/', sameSite: true, httpOnly: true,
			secure: !!process.env.PRODUCTION,
		} as CookieSerializeOptions
		req.doc.bits = security.randomBits(32)
		res.setCookie('x-bits', req.doc.bits, cookie)
		let token = security.token(req.doc, prime)
		res.setCookie('x-token', token, cookie)

		let response = { ishuman: !!rdoc.ishuman } as Security.Doc
		if (!rdoc.rhusername) return response;

		let invalid = await robinhood.validate(rdoc.rhusername, rdoc.rhtoken)
		if (invalid) {
			await redis.main.hdel(rkey, ...ikeys)
			return response
		}
		response.rhusername = rdoc.rhusername
		return response

	}
})
