// 

import '../main'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as robinhood from '../adapters/robinhood'
import * as security from '../adapters/security'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as socket from '../adapters/socket'
import clock from '../../common/clock'



clock.on('5s', function ontick(i) {
	let subs = [] as string[]
	socket.clients.forEach(client => {
		console.log('client.subs ->', client.subs)
	})
})



