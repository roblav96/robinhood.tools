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
		let rkey = `${rkeys.SECURITY.DOC}:${req.doc.uuid}`
		let resolved = await redis.main.coms([
			['hget', rkey, 'ishuman'],
			['hset', rkey, 'prime', prime],
		])
		let cookie = {
			domain: process.env.DOMAIN,
			path: '/', sameSite: true, httpOnly: true,
			secure: !!process.env.PRODUCTION,
		} as CookieSerializeOptions
		req.doc.bits = security.randomBits(32)
		res.setCookie('x-bits', req.doc.bits, cookie)
		let token = security.token(req.doc, prime)
		res.setCookie('x-token', token, cookie)
		return { ishuman: !!resolved[0] }
	}
})
