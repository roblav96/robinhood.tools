// 

import { CookieSerializeOptions } from 'cookie'
import * as _ from '../../common/lodash'
import * as redis from '../adapters/redis'
import * as security from '../adapters/security'
import polka from './polka'



polka.route({
	method: 'GET',
	url: '/api/security/token',
	public: true,
	handler(req, res) {
		let prime = security.randomBits(32)
		return Promise.resolve().then(function() {
			return redis.main.hset(`security:doc:${req.doc.uuid}`, 'prime', prime)
		}).then(function() {
			let cookie = {
				domain: process.env.DOMAIN,
				path: '/', sameSite: true, httpOnly: true,
				secure: !!process.env.PRODUCTION,
			} as CookieSerializeOptions
			req.doc.bits = security.randomBits(32)
			res.setCookie('x-bits', req.doc.bits, cookie)
			let token = security.token(req.doc, prime)
			res.setCookie('x-token', token, cookie)
		})
	}
})
