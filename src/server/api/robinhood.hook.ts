//

import * as redis from '../adapters/redis'
import * as boom from 'boom'
import polka from './polka'

polka.use(function robinhoodhook(req, res, next) {
	if (!req.match || !req.match.old) return next()

	let rhdocurl = polka.rhdocurls[req.match.old]
	if (rhdocurl) {
		if (!req.authed) {
			return next(boom.unauthorized('!req.authed', null, { hook: 'validator rhauthurl' }))
		}
		let ikeys = ['rhusername', 'rhtoken'] as KeysOf<Security.Doc>
		return redis.main
			.hmget(req.doc.rkey, ...ikeys)
			.catch(next)
			.then(function (rdoc: Security.Doc) {
				rdoc = redis.fixHmget(rdoc, ikeys)
				if (Object.keys(rdoc).length != ikeys.length) {
					return next(
						boom.unauthorized('rdoc != ikeys', null, { hook: 'validator rhauthurl' }),
					)
				}
				Object.assign(req.doc, rdoc)
				next()
			})
	}

	next()
})
