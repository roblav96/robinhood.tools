// 

import polka from './polka'
import * as security from '../adapters/security'



polka.hook(async function(req, res) {

	req.ip = security.reqip(req)

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




