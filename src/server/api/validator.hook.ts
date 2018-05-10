// 

import * as _ from '../../common/lodash'
import * as Polka from 'polka'
import * as boom from 'boom'
import * as FastestValidator from 'fastest-validator'
import * as http from '../adapters/http'
import * as matchit from 'matchit'
import polka from './polka'



polka.use(function validator(req, res, next) {
	let match = matchit.match(req.path, polka.routes[req.method])[0]
	if (!match || !match.old) return next();

	// let schemas = polka.schemas[match.old]
	let validators = polka.validators[match.old]
	if (!validators) return next();

	let keys = Object.keys(validators)
	let i: number, len = keys.length
	for (i = 0; i < len; i++) {
		let key = keys[i]
		let value = req[key]

		if (Object.keys(value).length == 0) {
			return next(boom.preconditionFailed(key, value))
		}

		// if (key == 'query') {
		// 	let schema = schemas[key]
		// 	Object.keys(schema).forEach(key => {
		// 		let rule = schema[key] as FastestValidator.SchemaValue
		// 		let v = value[key]
		// 		if (v && rule.type == 'array') {
		// 			value[key] = v.split(',')
		// 		}
		// 	})
		// }

		let validator = validators[key]
		let invalids = validator(value)
		if (Array.isArray(invalids)) {
			return next(boom.preconditionFailed(invalids[0].message, invalids[0]))
		}

	}
	next()
})





// setTimeout(function() {
// 	// http.get(`http://${process.env.HOST}:${process.env.PORT}/api/async/wut`, { retries: 0 }).then(function(response) {
// 	http.get('https://api.robinhood.com/instruments/').then(function(response) {
// 		console.log('response ->', response)
// 	}).catch(function(error) {
// 		console.error('setTimeout Error ->', error)
// 	})
// }, 1000)


