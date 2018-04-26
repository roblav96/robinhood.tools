// 

import polka from './polka'



polka.use(function(req, res, next) {
	// res.setHeader('Access-Control-Allow-Credentials', 'false')
	// res.setHeader('Access-Control-Expose-Headers', '*')
	// res.setHeader('Access-Control-Allow-Headers', '*')
	// res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
	res.setHeader('Access-Control-Allow-Origin', process.env.DOMAIN)
	// res.setHeader('Access-Control-Max-Age', (60 * 60 * 24).toString())
	res.setHeader('Vary', 'Origin')
	next()
})



import * as cookie from 'cookie'
polka.use(function(req, res, next) {
	let header = req.getHeader('cookie')
	Object.assign(req, {
		cookies: header ? cookie.parse(header) : {},
	})
	Object.assign(res, {
		setCookie(this: any, name, value, opts = {} as any) {
			if (Number.isFinite(opts.expires)) {
				opts.expires = new Date(opts.expires)
			}
			this.setHeader('Set-Cookie', cookie.serialize(name, value, opts))
		},
	})
	next()
})




