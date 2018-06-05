// 

import * as boom from 'boom'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import radio from '../adapters/radio'
import polka from './polka'



const PORTS = [] as number[]
radio.on('socket.listening', function onlistening(event) {
	let port = event.data as number
	if (!Number.isFinite(port) || PORTS.includes(port)) return;
	PORTS.push(port)
})
radio.emit('sockets.listening')

if (process.env.PRODUCTION && process.env.PRIMARY) {
	redis.main.del(rkeys.WS.DISCOVER)
}

polka.route({
	method: 'GET',
	url: '/api/websocket/discover',
	async handler(req, res) {
		radio.emit('sockets.listening')
		await new Promise(r => _.delay(r, 100))
		let protocol = process.env.DEVELOPMENT ? 'ws' : 'wss'
		let addresses = PORTS.map(port => `${protocol}://${process.env.DOMAIN}/websocket/${port}`)
		if (process.env.PRODUCTION) return addresses;
		let discover = await redis.main.smembers(rkeys.WS.DISCOVER) as string[]
		return addresses.concat(discover.map(port => `wss://${core.HOSTNAME}/websocket/${port}`))
	}
})


