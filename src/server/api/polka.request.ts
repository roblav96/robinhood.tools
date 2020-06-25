//

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as util from 'util'
import * as TurboRequest from 'turbo-http/lib/request'
import * as qs from 'querystring'
import * as Polka from 'polka'
import * as cookie from 'cookie'
import * as fastjsonparse from 'fast-json-parse'
import * as boom from 'boom'
import * as matchit from 'matchit'
import polka from './polka'

export interface PolkaRequest extends TurboRequest, Polka.Request {}
export class PolkaRequest {
	body: any
	headers: Dict<string>
	cookies: Dict<string>
	authed: boolean
	doc: Security.Doc
	match: matchit.Match
}
util.inherits(TurboRequest, PolkaRequest)

polka.use(function request(req, res, next) {
	req.headers = {}
	let rawheaders = req._options.headers
	let i: number,
		len = rawheaders.length
	for (i = 0; i < len; i += 2) {
		let header = rawheaders[i].toLowerCase()
		req.headers[header] = rawheaders[i + 1]
	}

	let cookies = req.headers['cookie']
	req.cookies = cookies ? cookie.parse(cookies) : {}

	req.match = matchit.match(req.path, polka.routes[req.method])[0]

	req.body = {}
	if (req.method == 'GET') return next()

	let chunks = [] as string[]
	req.ondata = function ondata(buffer, start, length) {
		let chunk = buffer.slice(start, length + start)
		chunks.push(chunk.toString())
	}
	req.onend = function onend() {
		req.ondata = _.noop
		req.onend = _.noop
		let body = chunks.join('')
		if (!body) return next()
		let content = req.headers['content-type']
		if (content == 'application/json') {
			let parsed = fastjsonparse(body)
			if (parsed.err) return next(boom.badData(parsed.err.message))
			req.body = parsed.value
		} else if (content == 'application/x-www-form-urlencoded') {
			req.body = qs.parse(body)
		} else {
			req.body = body
		}
		next()
	}
})
