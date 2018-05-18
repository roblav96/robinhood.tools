// 

import '../main'
import * as pAll from 'p-all'
import * as pQueue from 'p-queue'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as robinhood from '../adapters/robinhood'
import * as security from '../adapters/security'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as socket from '../adapters/socket'
import clock from '../../common/clock'



const queue5s = new pQueue({ concurrency: 1 })

clock.on('5s', function ontick(i) {
	if (queue5s.pending > 0) return;

	socket.clients.forEach(client => {
		if (!client.doc.rhtoken) return;

		client.subs.forEach(name => {
			if (name.indexOf(rkeys.RH.SYNC) != 0) return;

			let fn = robinhood.sync[name.split(':').pop()] as (doc: Security.Doc) => Promise<any>
			if (!fn) return;

			queue5s.add(() => fn(client.doc)).then(data => {
				// console.log('name ->', name, 'data ->', data)
				socket.send(client, name, data)
			})

		})
	})
})


