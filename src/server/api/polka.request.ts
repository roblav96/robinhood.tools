// 

import * as _ from '../../common/lodash'
import * as util from 'util'
import * as TurboRequest from 'turbo-http/lib/request'
import * as qs from 'querystring'
import * as Polka from 'polka'
import * as cookie from 'cookie'
import * as jsonparse from 'fast-json-parse'
import * as boom from 'boom'
import polka from './polka'



export interface PolkaRequest extends TurboRequest, Polka.Request { }
export class PolkaRequest {
	body: any
	headers: Dict<string>
	cookies: Dict<string>
}
util.inherits(TurboRequest, PolkaRequest)



polka.use(function(req, res, next) {
	if (!req._options) return next(); // node http

	// req.socket.on('connect', function() { console.log('connection -> connect') })
	// req.socket.on('finish', function() { console.log('connection -> finish') })
	// req.socket.on('end', function() { console.log('connection -> end') })
	// req.socket.on('close', function() { console.log('connection -> close') })
	// req.socket.on('error', function(error) { console.log('connection Error ->', error) })

	req.headers = {}
	let rawheaders = req._options.headers
	let i: number, len = rawheaders.length
	for (i = 0; i < len; i += 2) {
		let header = rawheaders[i].toLowerCase()
		req.headers[header] = rawheaders[i + 1]
	}
	let cookies = req.headers['cookie']
	if (cookies) req.cookies = cookie.parse(cookies);

	let chunks = [] as string[]
	req.ondata = function ondata(buffer, start, length) {
		let chunk = buffer.slice(start, length + start)
		chunks.push(chunk.toString())
	}
	req.onend = function onend() {
		req.ondata = _.noop; req.onend = _.noop
		let body = chunks.join('')
		if (!body) return next();
		let content = req.headers['content-type']
		if (content == 'application/json') {
			let parsed = jsonparse(body)
			if (parsed.err) return next(boom.badData(parsed.err));
			req.body = parsed.value
		} else if (content == 'application/x-www-form-urlencoded') {
			req.body = qs.parse(body)
		} else {
			req.body = body
		}
		next()
	}

})


