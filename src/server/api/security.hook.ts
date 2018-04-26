// 

import polka from './polka'
import * as security from '../adapters/security'



polka.hook(async function(req, res) {

	req.ip = security.reqip(req)

	req.doc = {
		id: req.getHeader('x-id'),
		uuid: req.getHeader('x-uuid'),
		finger: req.getHeader('x-finger'),
		bytes: req.cookies['x-bytes'],
		token: req.cookies['x-token'],
		hostname: security.sha1(req.getHeader('hostname')),
		useragent: security.sha1(req.getHeader('user-agent')),
	} as Security.Doc
	
	req.authed = await security.authorize({
		doc: req.doc,
		keys: req._headers.keys(),
		required: ['referer'],
		referer: req.getHeader('referer'),
	})

})




