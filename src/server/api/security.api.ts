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
		let prime = security.randomBits(security.LENGTHS.prime)
		let rkey = `${rkeys.SECURITY.DOC}:${req.doc.uuid}`
		await redis.main.hset(rkey, 'prime', prime)

		let cookie = {
			domain: process.env.DOMAIN,
			path: '/', sameSite: true, httpOnly: true,
			secure: !!process.env.PRODUCTION,
		} as CookieSerializeOptions
		req.doc.bits = security.randomBits(security.LENGTHS.bits)
		res.setCookie('x-bits', req.doc.bits, cookie)
		let token = security.token(req.doc, prime)
		res.setCookie('x-token', token, cookie)

	}
})
