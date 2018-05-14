// 

import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
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
		let response = await http.post('https://www.google.com/recaptcha/api/siteverify', {}, {
			query: { response: req.body.gresponse, secret: process.env.RECAPTCHA_SECRET, remoteip: req.doc.ip },
		}) as RecaptchaResponse

		let errors = response['error-codes']
		if (Array.isArray(errors)) {
			throw boom.badRequest(JSON.stringify(errors))
		}

		let stamp = new Date(response.challenge_ts).valueOf()
		let drift = Math.abs(Date.now() - stamp)
		if (drift > 60000) {
			throw boom.clientTimeout(`${drift}ms`)
		}

		if (!response.hostname.includes(process.env.DOMAIN)) {
			throw boom.internal('!response.hostname')
		}

		let doc = { ishuman: response.success } as Security.Doc
		await redis.main.hmset(`${rkeys.SECURITY.DOC}:${req.doc.uuid}`, doc)
		return doc
	}
})


