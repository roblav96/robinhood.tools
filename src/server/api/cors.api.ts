// 
// https://github.com/Tabcorp/restify-cors-middleware
// 

import polka from './polka'



const ORIGIN = process.env.DOMAIN
const MAX_AGE = (60 * 60 * 24).toString()
const ALLOW_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].join(',')
const ALLOW_HEADERS = [
	'x-id', 'x-uuid', 'x-finger', 'x-bytes', 'x-prime', 'x-token', 'x-version',
	'accept', 'accept-version', 'content-type', 'origin',
].join(',')
// const EXPOSE_HEADERS = [
// 	'content-length', 'content-type', 'date',
// ]

polka.use(function(req, res, next) {

	let origin = req.getHeader('origin')
	if (!origin || !origin.includes(ORIGIN)) {
		if (req.method == 'OPTIONS') res.end();
		return next()
	}
	res.setHeader('access-control-allow-origin', origin)

	if (req.method == 'OPTIONS') {
		// let acmethod = req.getHeader('access-control-request-method')
		// if (!ALLOW_METHODS.includes(acmethod)) return next();
		res.setHeader('access-control-allow-methods', ALLOW_METHODS)
		// let acheaders = req.getHeader('access-control-request-headers')
		// if (!ALLOW_HEADERS.includes(acheaders)) return next();
		res.setHeader('access-control-allow-headers', ALLOW_HEADERS)
		res.setHeader('access-control-allow-credentials', 'true')
		res.setHeader('vary', 'origin')
		res.end()
	}

	next()

})




