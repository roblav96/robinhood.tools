//

import * as boom from 'boom'
import polka from './polka'

polka.use(function validatorhook(req, res, next) {
	if (!req.match || !req.match.old) return next()

	let schemas = polka.schemas[req.match.old]
	let validators = polka.validators[req.match.old]
	if (validators) {
		let keys = Object.keys(validators)
		let i: number,
			len = keys.length
		for (i = 0; i < len; i++) {
			let key = keys[i]
			let value = req[key]

			let schema = schemas[key]
			let schemakeys = Object.keys(schema)
			let valuekeys = Object.keys(value)
			let ii: number,
				lenn = valuekeys.length
			for (ii = 0; ii < lenn; ii++) {
				let valuekey = valuekeys[ii]
				if (!schemakeys.includes(valuekey)) {
					return next(
						boom.preconditionFailed(`Invalid key '${valuekey}' in request ${key}`, {
							hook: 'validator',
						}),
					)
				}
			}

			let validator = validators[key]
			let invalids = validator(value)
			if (Array.isArray(invalids)) {
				let invalid = invalids[0]
				Object.assign(invalid, { key, value: value[invalid.field] })
				// let string = Object.keys(invalid).map(k => `${k}: ${invalid[k]}`).join(', ').trim()
				return next(boom.preconditionFailed(invalid.message, { hook: 'validator' }))
			}
		}
	}

	next()
})
