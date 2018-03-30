// 

import * as _ from 'lodash'
import * as core from '../../common/core'

import fastify from './fastify'
import * as boom from 'boom'
import ticks from '../../common/ticks'
import radio from '../services/radio'



fastify.route({
	method: 'GET',
	url: '/logger.*',
	handler: async function(request, reply) {
		return reply.sendFile(request.raw.url.substring(1))
	},
})



// process.EE4.on('log', function(log) {
// 	console.log('fastify.log.on ->', log)
// 	radio.emit('log', log)
// })

ticks.on(ticks.T10, function(i) {
	fastify.log.warn('ticks.T10', i)
})



