// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import * as pAll from 'p-all'
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
	handler: async function apilogin(req, res) {
		let rkey = `${rkeys.SECURITY.DOC}:${req.doc.uuid}`

		let ishuman = await redis.main.hget(rkey, 'ishuman')
		if (!ishuman) throw boom.unauthorized('!ishuman');

		let oauth = await robinhood.login(req.body)
		if (oauth.mfa_required) return { mfa: true };
		if (!oauth.access_token || !oauth.refresh_token) {
			throw boom.illegal('!oauth.token')
		}

		let rdoc = {
			rhtoken: oauth.access_token,
			rhrefresh: oauth.refresh_token,
		} as Security.Doc

		let accounts = await http.get('https://api.robinhood.com/accounts/', {
			rhtoken: rdoc.rhtoken, retries: 0,
		}) as Robinhood.Api.Paginated<Robinhood.Account>
		let account = _.get(accounts, 'results[0]') as Robinhood.Account
		console.log('account ->', account)
		if (!account) throw boom.notFound('account');
		rdoc.rhaccount = account.account_number
		console.log('rdoc.rhaccount ->', rdoc.rhaccount)

		let user = await http.get(account.user, { rhtoken: rdoc.rhtoken, retries: 0 }) as Robinhood.User
		console.log('user ->', user)
		rdoc.rhusername = user.username

		await redis.main.hmset(rkey, rdoc)

		return _.pick(rdoc, ['rhusername', 'rhaccount'] as KeysOf<Security.Doc>)

	}
})



polka.route({
	method: 'GET',
	url: '/api/robinhood/logout',
	rhdoc: true,
	handler: async function apilogout(req, res) {
		let revoked = await robinhood.revoke(req.doc.rhtoken)
		let rkey = `${rkeys.SECURITY.DOC}:${req.doc.uuid}`
		let ikeys = ['rhusername', 'rhaccount', 'rhtoken', 'rhrefresh'] as KeysOf<Security.Doc>
		await redis.main.hdel(rkey, ...ikeys)
	}
})



polka.route({
	method: 'POST',
	url: '/api/robinhood/sync',
	rhdoc: true,
	schema: {
		body: {
			synckeys: { type: 'array', items: 'string', optional: true },
			positions: { type: 'object', optional: true },
		},
	},
	handler: async function apisync(req, res) {
		let allsyncs = Object.keys(robinhood.sync)
		let synckeys = (req.body.synckeys || allsyncs) as string[]

		let invalids = _.difference(synckeys, allsyncs)
		if (invalids.length > 0) throw boom.notAcceptable(invalids.toString(), { invalids });

		let resolved = await pAll(synckeys.map(key => {
			return () => {
				let args = [req.doc]
				if (req.body[key]) args.push(req.body[key]);
				return robinhood.sync[key](...args)
			}
		}), { concurrency: 1 })

		let response = {} as any
		synckeys.forEach((k, i) => response[k] = resolved[i])
		return response

	}
})



// polka.route({
// 	method: 'GET',
// 	url: '/api/robinhood/init',
// 	authed: true,
// 	handler: async function apiinit(req, res) {
// 		let rkey = `${rkeys.SECURITY.DOC}:${req.doc.uuid}`
// 		let ikeys = ['rhusername', 'rhaccount'] as KeysOf<Security.Doc>
// 		let rdoc = await redis.main.hmget(rkey, ...ikeys) as Security.Doc
// 		rdoc = redis.fixHmget(rdoc, ikeys)
// 		return {
// 			rhusername: rdoc.rhusername,
// 			rhaccount: rdoc.rhaccount,
// 		} as Security.Doc
// 	}
// })


