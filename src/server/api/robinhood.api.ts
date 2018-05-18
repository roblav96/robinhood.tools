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
		let ishuman = await redis.main.hget(req.doc.rkey, 'ishuman')
		if (ishuman != 'true') throw boom.unauthorized('ishuman != true');

		let oauth = await robinhood.login(req.body)
		if (oauth.mfa_required) return { mfa: true };
		if (!oauth.access_token || !oauth.refresh_token) {
			throw boom.illegal('!oauth.token')
		}

		let rdoc = {
			rhtoken: oauth.access_token,
			rhrefresh: oauth.refresh_token,
		} as Security.Doc

		// let accounts = await http.get('https://api.robinhood.com/accounts/', {
		// 	rhtoken: rdoc.rhtoken, retries: 0,
		// }) as Robinhood.Api.Paginated<Robinhood.Account>
		// let account = _.get(accounts, 'results[0]') as Robinhood.Account
		// if (!account) throw boom.notFound('account');

		let user = await robinhood.sync.user(rdoc.rhtoken)
		rdoc.rhusername = user.username

		await redis.main.hmset(req.doc.rkey, rdoc)

		return { rhusername: rdoc.rhusername } as Security.Doc

	}
})



polka.route({
	method: 'GET',
	url: '/api/robinhood/logout',
	rhdoc: true,
	handler: async function apilogout(req, res) {
		let revoked = await robinhood.revoke(req.doc.rhtoken)
		let ikeys = ['rhusername', 'rhtoken', 'rhrefresh'] as KeysOf<Security.Doc>
		await redis.main.hdel(req.doc.rkey, ...ikeys)
	}
})



polka.route({
	method: 'POST',
	url: '/api/robinhood/sync',
	rhdoc: true,
	schema: {
		body: {
			synckeys: { type: 'array', items: 'string', optional: true },
			all: { type: 'boolean', optional: true },
		},
	},
	handler: async function apisync(req, res) {
		let allsyncs = Object.keys(robinhood.sync)
		let synckeys = (req.body.synckeys || allsyncs) as string[]

		let invalids = _.difference(synckeys, allsyncs)
		if (invalids.length > 0) throw boom.notAcceptable(invalids.toString(), { invalids });

		let opts = { all: req.body.all == true }
		let resolved = await pAll(synckeys.map(key => {
			return () => robinhood.sync[key](req.doc.rhtoken, opts)
		}), { concurrency: 1 })

		let response = {} as any
		synckeys.forEach((k, i) => response[k] = resolved[i])
		return response

	}
})


