// 

import { PolkaRequest } from './polka.request'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as security from '../adapters/security'
import * as redis from '../adapters/redis'
import * as url from 'url'
import * as boom from 'boom'
import polka from './polka'



polka.use(function securityhook(req, res, next) {
	req.authed = false
	
	let doc = {
		ip: security.ip(req.headers),
		uuid: req.cookies['x-uuid'],
		finger: req.cookies['x-finger'],
		useragent: req.headers['user-agent'],
		bits: req.cookies['x-bits'],
		token: req.cookies['x-token'],
	} as Security.Doc

	let failed = security.isDoc(doc)
	if (failed) return next(boom.preconditionFailed(failed, { hook: 'security' }));
	req.doc = doc

	if (!req.doc.token) return next();
	security.reqDoc(req).then(next).catch(next)

})




