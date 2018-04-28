// 

import polka from './polka'



const ORIGIN = process.env.DOMAIN
const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].join(',')
const HEADERS = ['x-id', 'x-uuid', 'x-finger'].join(',')
const MAX_AGE = (60 * 60 * 24).toString()

polka.use(function(req, res, next) {

	// let origin = req.getHeader('origin')
	// if (!origin) return next();

	// let acmethod = req.getHeader('Access-Control-Request-Method')
	// let acheader = req.getHeader('Access-Control-Request-Header')

	// if (req.method == 'OPTIONS' && acmethod) {
	// 	// if (!METHODS.includes(acmethod)) return next();
	// 	res.setHeader('Access-Control-Allow-Methods', METHODS)
	// 	res.setHeader('Access-Control-Allow-Headers', HEADERS)
	// }

	next()

})




