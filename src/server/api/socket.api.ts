// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as security from '../adapters/security'
import * as redis from '../adapters/redis'
import * as os from 'os'
import * as pandora from 'pandora'
import polka from './polka'



polka.route({
	method: 'GET',
	url: '/api/websocket/discover',
	public: true,
	handler(req, res) {
		return Promise.resolve().then(function() {
			return redis.main.scard(rkeys.WS.DISCOVER)
		}).then(function(scard) {
			return core.array.create(scard).map(function(i) {
				return `ws://${process.env.DOMAIN}/websocket/${i}`
				// return `ws://${process.env.HOST}:${+process.env.IPORT + os.cpus().length + i}/websocket/${i}`
			})
		})
	}
})





