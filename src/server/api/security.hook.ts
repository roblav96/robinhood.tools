// 

import { PolkaRequest } from './polka.request'
import * as core from '../../common/core'
import * as security from '../adapters/security'
import * as redis from '../adapters/redis'
import * as url from 'url'
import * as boom from 'boom'
import polka from './polka'



polka.use(function(req, res, next) {

	req.authed = false
	req.doc = {
		ip: security.reqip(req),
		id: req.headers['x-id'],
		uuid: req.headers['x-uuid'],
		finger: req.headers['x-finger'],
		stamp: req.headers['x-stamp'] as any,
		hostname: req.headers['hostname'],
		useragent: req.headers['user-agent'],
		bytes: req.cookies['x-bytes'],
		token: req.cookies['x-token'],
	} as Security.Doc

	if (isNaN(req.doc.stamp)) return next(boom.preconditionRequired('stamp'));
	req.doc.stamp = Number.parseInt(req.doc.stamp as any)
	if (Math.abs(Date.now() - req.doc.stamp) > 60000) {
		return next(boom.preconditionFailed('stamp'))
	}

	let required = ['ip', 'uuid', 'finger', 'hostname', 'useragent'] as KeysOf<Security.Doc>
	let i: number, len = required.length
	for (i = 0; i < len; i++) {
		let key = required[i]
		let value = req.doc[key]
		if (!value || typeof value != 'string') {
			return next(boom.preconditionRequired(key))
		}
	}
	
	if (!req.doc.token) return next();
	redis.main.hget('security:doc:' + req.doc.uuid, 'prime').then(function(prime) {
		if (prime) {
			req.authed = req.doc.token == security.generateToken(req.doc, prime)
		}
		next()
	}).catch(next)

})




