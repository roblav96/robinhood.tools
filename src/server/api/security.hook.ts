// 

import { PolkaRequest } from './polka.request'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as security from '../adapters/security'
import * as redis from '../adapters/redis'
import * as url from 'url'
import * as boom from 'boom'
import polka from './polka'



polka.use(function(req, res, next) {
	req.authed = false

	let doc = {
		ip: security.ip(req.headers),
		id: req.headers['x-id'],
		uuid: req.headers['x-uuid'],
		finger: req.headers['x-finger'],
		hostname: req.headers['hostname'],
		useragent: req.headers['user-agent'],
		bits: req.cookies['x-bits'],
		token: req.cookies['x-token'],
	} as Security.Doc

	let failed = security.isDoc(doc)
	if (failed) return next(boom.preconditionFailed(failed));
	req.doc = doc

	if (!req.doc.token) return next();
	redis.main.hget(`${rkeys.SECURITY.DOC}:${req.doc.uuid}`, 'prime').then(function(prime) {
		if (prime) req.authed = req.doc.token == security.token(req.doc, prime);
		next()
	}).catch(next)

})




