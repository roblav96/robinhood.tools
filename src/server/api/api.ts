// 

import '../main'
import { ServiceContextAccessor } from 'pandora/dist/service/ServiceContextAccessor'
import * as pandora from 'pandora'
import polka from './api.polka'



export default class Api {

	constructor(public context: ServiceContextAccessor) {

	}

	async start() {
		await polka.listen(+process.env.PORT, process.env.HOST)
		console.info('listening ->', process.env.PORT)
	}

	async stop() {
		console.warn('stop ->', process.pid)
		process.emit('beforeExit', 0)
		await Promise.all(polka.server.connections.map(function(v) {
			return new Promise(resolve => v.close(resolve))
		}))
		await new Promise(resolve => {
			polka.server.close(resolve)
		})
	}

}


