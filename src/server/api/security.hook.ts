// 

import * as util from 'util'
import * as _ from 'lodash'
import * as core from '../../common/core'

import fastify from './fastify'
import * as url from 'url'
import * as redis from '../adapters/redis'
import * as security from '../services/security'



fastify.addHook('preHandler', async function(request, reply) {

	request.ip = security.getip(request.req)

	request.doc = {
		id: request.headers['x-id'],
		uuid: request.headers['x-uuid'],
		finger: request.headers['x-finger'],
		bytes: request.cookies['x-bytes'],
		token: request.cookies['x-token'],
		hostname: security.sha1(request.headers['hostname']),
		useragent: security.sha1(request.headers['user-agent']),
	} as Security.Doc

	request.authed = await security.authorize({
		doc: request.doc,
		keys: Object.keys(request.headers),
		required: ['referer'],
		referer: request.headers['referer'],
	})

})




