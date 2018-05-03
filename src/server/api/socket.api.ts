// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as security from '../adapters/security'
import * as os from 'os'
import polka from './polka'



polka.route({
	method: 'GET',
	url: '/api/websocket/discover',
	public: true,
	handler(req, res) {
		return Promise.resolve(core.array.create(+process.env.INSTANCES).map(function(i) {
			// return `ws://${process.env.DOMAIN}/websocket/${i}`
			return `ws://${process.env.HOST}:${+process.env.IPORT + os.cpus().length + i}/websocket/${i}`
		}))
	}
})





