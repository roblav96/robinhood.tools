// 

import polka from './polka'



const ORIGIN = process.env.DOMAIN
const ALLOW_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].join(',')
const ALLOW_HEADERS = [
	'accept', 'accept-version', 'content-type', 'date', 'origin',
	// 'x-id', 'x-uuid', 'x-finger', 'x-bytes', 'x-prime', 'x-token', 'x-version',
].join(',')



polka.use(function cors(req, res, next) {

	let origin = req.headers['origin']
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
		// res.setHeader('access-control-allow-credentials', 'true')
		res.setHeader('vary', 'origin')
		res.end()
	}

	next()

})




