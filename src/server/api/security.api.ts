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
	handler: async function apitoken(req, res) {
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

		if (!req.authed) return;

		let ikeys = ['rhusername', 'rhaccount', 'rhtoken', 'rhrefresh'] as KeysOf<Security.Doc>
		let rdoc = await redis.main.hmget(rkey, ...ikeys) as Security.Doc
		rdoc = redis.fixHmget(rdoc, ikeys)
		if (Object.keys(rdoc).length != ikeys.length) return;

		let oauth = await robinhood.refresh(rdoc.rhrefresh).catch(function(error) {
			console.error('oauth refresh Error ->', error)
		}) as Robinhood.Oauth

		if (!oauth) {
			console.warn('!oauth ->', oauth)
			await robinhood.revoke(rdoc.rhtoken).catch(function(error) {
				console.error('oauth revoke Error ->', error)
			})
			await redis.main.hdel(rkey, ...ikeys)
			return { rhusername: '', rhaccount: '' } as Security.Doc
		}

		await redis.main.hmset(rkey, {
			rhtoken: oauth.access_token,
			rhrefresh: oauth.refresh_token,
		} as Security.Doc)

		return _.pick(rdoc, ['rhusername', 'rhaccount'] as KeysOf<Security.Doc>)

	}
})
