// 

import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as os from 'os'
import polka from './polka'



if (process.env.FIRST) redis.main.del(rkeys.WS.DISCOVER);

polka.route({
	method: 'GET',
	url: '/api/websocket/discover',
	public: true,
	async handler(req, res) {
		let scard = await redis.main.scard(rkeys.WS.DISCOVER)
		return core.array.create(scard).map(function(i) {
			return `ws://${process.env.DOMAIN}/websocket/${i}`
			// return `ws://${process.env.HOST}:${+process.env.IPORT + os.cpus().length + i}/websocket/${i}`
		})
	}
})





