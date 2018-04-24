// 

import polka from './polka'



import * as cors from 'cors'
polka.use(cors({ origin: process.env.DOMAIN }))



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




