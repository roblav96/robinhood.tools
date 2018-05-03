// 
export * from '../../common/security'
// 

import * as http from 'http'
import * as url from 'url'
import * as boom from 'boom'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as security from '../../common/security'
import * as redis from '../adapters/redis'



export function generateToken(doc: Security.Doc, prime: string) {
	return security.hmac256(doc.uuid + doc.finger + doc.bytes + doc.useragent + doc.hostname, prime)
}

export function reqip(req): string {
	return req.headers['x-forwarded-for'] || req.headers['x-real-ip']
}



