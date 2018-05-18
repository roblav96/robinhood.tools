// 

import * as _ from '../../common/lodash'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as Polka from 'polka'
import * as boom from 'boom'
import * as FastestValidator from 'fastest-validator'
import * as http from '../adapters/http'
import * as matchit from 'matchit'
import polka from './polka'



polka.use(function validator(req, res, next) {
	let match = matchit.match(req.path, polka.routes[req.method])[0]
	if (!match || !match.old) return next();

	let validators = polka.validators[match.old]
	if (validators) {
		let keys = Object.keys(validators)
		let i: number, len = keys.length
		for (i = 0; i < len; i++) {
			let key = keys[i]
			let value = req[key]
			let validator = validators[key]
			let invalids = validator(value)
			if (Array.isArray(invalids)) {
				let invalid = invalids[0]
				Object.assign(invalid, { key, value: value[invalid.field] })
				return next(boom.preconditionFailed(JSON.stringify(invalid), { hook: 'validator' }))
			}
		}
	}

	let rhdocurl = polka.rhdocurls[match.old]
	if (rhdocurl) {
		if (!req.authed) {
			return next(boom.unauthorized('!req.authed', null, { hook: 'validator rhauthurl' }))
		}
		let ikeys = ['rhusername', 'rhaccount', 'rhtoken'] as KeysOf<Security.Doc>
		return redis.main.hmget(req.doc.rkey, ...ikeys).catch(next).then(function(rdoc: Security.Doc) {
			rdoc = redis.fixHmget(rdoc, ikeys)
			if (Object.keys(rdoc).length != ikeys.length) {
				return next(boom.unauthorized('rdoc != ikeys', null, { hook: 'validator rhauthurl' }))
			}
			Object.assign(req.doc, rdoc)
			next()
		})
	}

	next()

})





// setTimeout(function() {
// 	// http.get(`http://${process.env.HOST}:${process.env.PORT}/api/async/wut`, { retries: 0 }).then(function(response) {
// 	http.get('https://api.robinhood.com/instruments/').then(function(response) {
// 		console.log('response ->', response)
// 	}).catch(function(error) {
// 		console.error('setTimeout Error ->', error)
// 	})
// }, 1000)


