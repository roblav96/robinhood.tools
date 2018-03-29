// 

import * as util from 'util'
import * as _ from 'lodash'
import * as core from '../../common/core'

import fastify from './fastify'
import * as boom from 'boom'



fastify.route({
	method: 'GET',
	url: '/api/socket/addresses',
	handler: async function(this: FastifyInstance, request, reply) {
		let domain = process.DOMAIN.replace('http', 'ws')
		let addresses = core.array.create(process.INSTANCES).map(function(i) {
			return domain + '/websocket/' + i
		})
		return addresses
	},
})



fastify.route({
	method: 'POST',
	url: '/api/socket/subscribe',
	handler: async function(this: FastifyInstance, request, reply) {

	},
})


