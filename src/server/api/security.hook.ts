// 

import * as boom from 'boom'
import * as security from '../adapters/security'
import polka from './polka'



polka.puse(async function(req, res) {

	req.ip = security.reqip(req)
	if (!req.ip) throw boom.preconditionRequired('Missing IP address');

	req.doc = {
		id: req.headers['x-id'],
		uuid: req.headers['x-uuid'],
		finger: req.headers['x-finger'],
		bytes: req.cookies['x-bytes'],
		token: req.cookies['x-token'],
		hostname: security.sha1(req.headers['hostname']),
		useragent: security.sha1(req.headers['user-agent']),
	} as Security.Doc

	req.authed = await security.authorize({
		doc: req.doc,
		keys: Object.keys(req.headers),
		required: ['referer'],
		referer: req.headers['referer'],
	})

})




