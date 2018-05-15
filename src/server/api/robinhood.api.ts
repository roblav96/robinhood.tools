// 

import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import * as boom from 'boom'
import polka from './polka'



polka.route({
	method: 'POST',
	url: '/api/robinhood/login',
	authed: true,
	schema: {
		body: {
			username: 'string',
			password: 'string',
			mfa: { type: 'string', optional: true },
		},
	},
	async handler(req, res) {
		let rkey = `${rkeys.SECURITY.DOC}:${req.doc.uuid}`

		let ishuman = await redis.main.hget(rkey, 'ishuman')
		if (!ishuman) throw boom.unauthorized('!ishuman');

		let oauth = await robinhood.login(req.body)
		if (oauth.mfa_required) return { mfa: true };
		if (!oauth.access_token || !oauth.refresh_token) {
			throw boom.illegal('!oauth.access_token')
		}

		await redis.main.hmset(rkey, {
			rhusername: req.body.username,
			rhtoken: oauth.access_token,
			rhrefresh: oauth.refresh_token,
			rhexpires: oauth.expires_in,
		} as Security.Doc)

		// let invalid = await robinhood.validate(username, login.access_token)
		// if (invalid) throw boom.illegal(invalid);

	}
})



polka.route({
	method: 'GET',
	url: '/api/robinhood/sync',
	rhdoc: true,
	async handler(req, res) {
		console.log('req.doc ->', req.doc)
	}
})





// if (!req.authed) return;

// let ikeys = ['rhusername', 'rhrefresh'] as KeysOf<Security.Doc>
// let rdoc = await redis.main.hmget(rkey, ...ikeys) as Security.Doc
// rdoc = redis.fixHmget(rdoc, ikeys)
// // console.log('rdoc ->', rdoc)
// if (Object.keys(rdoc).length != ikeys.length) return;

// let response = { rhusername: rdoc.rhusername } as Security.Doc
// let oauth = await robinhood.refresh(rdoc.rhrefresh).catch(function(error) {
// 	console.error('robinhood.refresh Error ->', error)
// }) as Robinhood.Api.Login

// if (!oauth) {
// 	ikeys = ikeys.concat(['rhaccount', 'rhtoken', 'rhexpires'])
// 	await redis.main.hdel(rkey, ...ikeys)
// 	response.rhusername = ''
// 	return response
// }

// await redis.main.hmset(rkey, {
// 	rhtoken: oauth.access_token,
// 	rhrefresh: oauth.refresh_token,
// 	rhexpires: oauth.expires_in,
// } as Security.Doc)
// return response


