// 

import * as boom from 'boom'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import radio from '../adapters/radio'
import polka from './polka'



const PORTS = [] as number[]
radio.on('set.socket.listening', function onlistening(event) {
	let port = event.data as number
	if (Number.isFinite(port) && !PORTS.includes(port)) {
		PORTS.push(port)
	}
})

polka.route({
	method: 'GET',
	url: '/api/websocket/discover',
	async handler(req, res) {
		radio.emit('get.socket.listening')
		await new Promise(r => _.delay(r, 100))
		// if (PORTS.length == 0) throw boom.badGateway('socket.listening');
		let protocol = process.env.DEVELOPMENT ? 'ws' : 'wss'
		return PORTS.map(port => `${protocol}://${process.env.DOMAIN}/websocket/${port}`)
	}
})


