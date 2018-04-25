// 

import polka from './polka'



Object.assign(polka, {
	route(this: any, opts: {
		method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'
		pattern: string
		validator?: never // WIP
		handler: (req, res) => void
	}) {
		if (process.env.PRIMARY) console.log('this ->', this);
		this[opts.method.toLowerCase()](opts.pattern, opts.handler)
	},
})


