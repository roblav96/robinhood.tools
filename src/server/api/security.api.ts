//

import { CookieSerializeOptions } from 'cookie'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as security from '../adapters/security'
import * as robinhood from '../adapters/robinhood'
import * as boom from 'boom'
import * as url from 'url'
import polka from './polka'

polka.route({
	method: 'GET',
	url: '/api/security/token',
	handler: async function apitoken(req, res) {
		let prime = security.randomBits(security.LENGTHS.prime)
		let resolved = await redis.main.coms([
			['hset', req.doc.rkey, 'prime', prime],
			['hget', req.doc.rkey, 'ishuman'],
		])
		let response = { ishuman: resolved.pop() == 'true' } as Security.Doc

		let cookie = {
			domain: core.HOSTNAME,
			path: '/',
			sameSite: true,
			httpOnly: true,
			secure: !!process.env.PRODUCTION,
		} as CookieSerializeOptions
		req.doc.bits = security.randomBits(security.LENGTHS.bits)
		res.setCookie('x-bits', req.doc.bits, cookie)
		let token = security.token(req.doc, prime)
		res.setCookie('x-token', token, cookie)

		if (!req.authed) return response

		let ikeys = ['rhusername', 'rhtoken', 'rhrefresh'] as KeysOf<Security.Doc>
		let rdoc = (await redis.main.hmget(req.doc.rkey, ...ikeys)) as Security.Doc
		rdoc = redis.fixHmget(rdoc, ikeys)
		if (Object.keys(rdoc).length != ikeys.length) return response

		response.rhusername = rdoc.rhusername

		let oauth = (await robinhood.refresh(rdoc.rhrefresh).catch(function (error) {
			console.error('oauth refresh Error ->', error)
		})) as Robinhood.Oauth

		if (!oauth) {
			console.warn('!oauth ->', oauth)
			await robinhood.revoke(rdoc.rhtoken).catch(function (error) {
				console.error('oauth revoke Error ->', error)
			})
			await redis.main.hdel(req.doc.rkey, ...ikeys)
			Object.assign(response, { rhusername: '' } as Security.Doc)
			return response
		}

		await redis.main.hmset(req.doc.rkey, {
			rhtoken: oauth.access_token,
			rhrefresh: oauth.refresh_token,
		} as Security.Doc)

		return response
	},
})
