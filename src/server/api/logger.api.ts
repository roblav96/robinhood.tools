// 

import * as util from 'util'
import * as _ from 'lodash'
import * as core from '../../common/core'

import fastify from './fastify'
import * as boom from 'boom'
import * as got from 'got'



fastify.route({
	method: 'GET',
	url: '/logger',
	handler: async function(request, reply) {
		return reply.sendFile('logger.html')
	},
})


