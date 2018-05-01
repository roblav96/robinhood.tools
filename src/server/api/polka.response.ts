// 

import * as _ from '../../common/lodash'
import * as util from 'util'
import * as TurboResponse from 'turbo-http/lib/response'
import * as cookie from 'cookie'
import * as boom from 'boom'
import polka from './polka'



export interface PolkaResponse extends TurboResponse { }
export class PolkaResponse {
	setCookie(key: string, value: string, opts: cookie.CookieSerializeOptions) {
		this.setHeader('set-cookie', cookie.serialize(key, value, opts))
	}
	writeHead(code: number, headers: Dict<string>) {
		this.statusCode = code;
		Object.keys(headers).forEach(key => {
			this.setHeader(key, headers[key])
		})
	}
	send(data?: any) {
		if (data == null) return this.end();
		if (typeof data == 'object') {
			data = JSON.stringify(data)
			this.setHeader('content-type', 'application/json')
		}
		this.end(data)
	}
}
util.inherits(TurboResponse, PolkaResponse)



// polka.use(function(req, res, next) {
// 	next()
// })


