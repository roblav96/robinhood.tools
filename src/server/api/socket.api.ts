// 

import * as util from 'util'
import * as _ from 'lodash'
import * as core from '../../common/core'

import fastify from './fastify'
import * as boom from 'boom'



fastify.route({
	method: 'GET',
	url: '/api/socket/addresses',
	handler: async function(request, reply) {
		let address = 'ws' + (PRODUCTION ? 's' : '') + '://' + process.DOMAIN
		let addresses = core.array.create(process.INSTANCES).map(function(i) {
			return address + '/websocket/' + i
		})
		return addresses
	},
})



fastify.route({
	method: 'POST',
	url: '/api/socket/subscribe',
	handler: async function(request, reply) {

	},
})


