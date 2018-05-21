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
import * as hours from '../adapters/hours'
import clock from '../../common/clock'



const queue = new pQueue({ concurrency: 1 })

clock.on('1s', function ontick(i) {
	if (queue.pending > 0) return;

	let mod = 3
	let state = hours.rxstate.value
	if (state == 'CLOSED') mod = 10;
	if (state == 'REGULAR') mod = 1;
	if (i % mod > 0) return;

	let ii = -1
	let chunked = core.array.create(socket.wss.clients.length)
	let chunk = core.array.chunks(chunked, +process.env.SCALE)[+process.env.INSTANCE]
	socket.wss.clients.forEach((client: Socket.Client) => {
		ii++; if (!client.doc.rhtoken || !chunk.includes(ii)) return;

		client.subs.forEach(name => {
			if (name.indexOf(rkeys.RH.SYNC) != 0) return;

			let key = name.split(':').pop()
			let fn = robinhood.sync[key] as (doc: Security.Doc) => Promise<any>
			if (!fn) return;

			queue.add(() => fn(client.doc).then(data => {
				socket.send(client, name, { [key]: data })
			}).catch(console.error))

		})
	})
})


