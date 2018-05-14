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
	ishuman: true,
	schema: {
		body: {
			username: 'string',
			password: 'string',
			mfa: { type: 'string', optional: true },
		},
	},
	async handler(req, res) {
		let username = req.body.username as string
		let response = await robinhood.login(req.body)
		if (response.mfa_required) {
			return { mfa: true }
		}
		if (!(response.access_token && response.refresh_token)) {
			throw boom.illegal('!response.access_token')
		}
		await robinhood.validate(username, response.access_token)
		let doc = {
			rhusername: username,
			rhtoken: response.access_token,
			rhrefresh: response.refresh_token,
			rhexpires: response.expires_in,
		} as Security.Doc
		console.log('login doc ->', doc)
		await redis.main.hmset(`${rkeys.SECURITY.DOC}:${req.doc.uuid}`, doc)
	}
})


