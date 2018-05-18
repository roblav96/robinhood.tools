// 

import * as boom from 'boom'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import polka from './polka'



const PORTS = [] as number[]
pandora.on('socket.listening', function onlistening(hubmsg) {
	let port = hubmsg.data.port as number
	if (Number.isFinite(port) && !PORTS.includes(port)) {
		PORTS.push(port)
	}
})

polka.route({
	method: 'GET',
	url: '/api/websocket/discover',
	async handler(req, res) {
		pandora.broadcast({}, 'socket.listening')
		await new Promise(r => setTimeout(r, 100))
		// if (PORTS.length == 0) throw boom.badGateway('socket.listening');
		let start = +process.env.PORT
		return PORTS.map(port => `ws://${process.env.DOMAIN}/websocket/${port - start}`)
	}
})


