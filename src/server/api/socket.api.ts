// 

import * as util from 'util'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'

import fastify from './fastify'
import * as boom from 'boom'
import wss from './socket.server'



fastify.route({
	method: 'GET',
	url: '/api/websocket/addresses',
	handler: async function(request, reply) {
		let address = 'ws' + (PRODUCTION ? 's' : '') + '://' + process.DOMAIN
		return core.array.create(process.INSTANCES).map(function(i) {
			return address + '/websocket/' + i
		})
	},
})



// fastify.all('/websocket/0', {}, async function (request, reply) {
// 	console.info('request ->', console.dump(request))
// })

// console.log('fastify.all ->', fastify.get)

// fastify.route({
// 	method: 'POST',
// 	url: '/api/socket/subscribe',
// 	handler: async function(request, reply) {

// 	},
// })


