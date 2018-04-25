// 

import * as _ from '../../common/lodash'
import polka from './polka'



polka.use(function(req, res, next) {
	// res.setHeader('Access-Control-Allow-Credentials', 'true')
	// res.setHeader('Access-Control-Expose-Headers', '*')
	res.setHeader('Access-Control-Allow-Headers', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
	res.setHeader('Access-Control-Allow-Origin', process.env.DOMAIN)
	res.setHeader('Access-Control-Max-Age', (60 * 60 * 24).toString())
	res.setHeader('Vary', 'Accept-Encoding,Origin')
	next()
})



import * as cookie from 'cookie'
polka.use(function(req, res, next) {
	let header = req.getHeader('cookie')
	req.cookies = header ? cookie.parse(header) : {}
	Object.assign(res, {
		setCookie(this: any, name, value, opts = {} as any) {
			if (Number.isFinite(opts.expires)) {
				opts.expires = new Date(opts.expires)
			}
			let serialized = cookie.serialize(name, value, opts)
			let setcookie = this.getHeader('Set-Cookie')
			if (!setcookie) {
				this.setHeader('Set-Cookie', serialized)
				return
			}
			if (setcookie.constructor == String) {
				setcookie = [setcookie]
			}
			setcookie.push(serialized)
			this.setHeader('Set-Cookie', setcookie)
		},
	})
	next()
})




