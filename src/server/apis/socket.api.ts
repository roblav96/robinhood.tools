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
		return core.array.create(process.INSTANCES).map(function(i) {
			return domain + '/websocket/' + i
		})
	},
})



fastify.route({
	method: 'POST',
	url: '/api/socket/subscribe',
	handler: async function(this: FastifyInstance, request, reply) {
		let domain = process.DOMAIN.replace('http', 'ws')
		return core.array.create(process.INSTANCES).map(function(i) {
			return domain + '/websocket/' + i
		})
	},
})


