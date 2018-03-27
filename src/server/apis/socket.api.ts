// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import fastify from '../fastify'
import * as boom from 'boom'



fastify.route({
	method: 'GET',
	url: '/api/socket/addresses',
	handler: async function(this: FastifyInstance, request, reply) {
		let domain = process.DOMAIN.replace('http', 'ws')
		let addresses = [] as string[]
		let i: number, len = process.INSTANCES
		for (i = 0; i < len; i++) {
			addresses.push(domain + '/websocket/' + i)
		}
		return addresses
	},
})


