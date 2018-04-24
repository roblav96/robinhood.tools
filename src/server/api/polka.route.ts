// 

import polka from './polka'



Object.assign(polka, {
	route(this: any, opts: {
		method: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'DELETE'
		pattern: string
		validator?: never // WIP
		handler: (req, res) => void
	}) {
		if (process.env.PRIMARY) console.log('this ->', this);
		this[opts.method.toLowerCase()](opts.pattern, opts.handler)
	},
})


