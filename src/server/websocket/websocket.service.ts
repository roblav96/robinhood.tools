// 

import '../main'
import { ServiceContextAccessor } from 'pandora/dist/service/ServiceContextAccessor'
import * as pandora from 'pandora'
import * as websocket from './websocket'



export default class WebSocketService {

	constructor(public context: ServiceContextAccessor) {
		
	}

	async start() {
		await new Promise(function(resolve, reject) {
			websocket.server.listen(+process.env.PORT, process.env.HOST, function(error) {
				if (error) return reject(error); resolve();
			})
		})
		console.info('listening ->', process.env.PORT)
	}

	async stop() {
		console.log('stop ->', process.pid)
		process.emit('beforeExit', 0)
		await new Promise(resolve => websocket.server.close(resolve))
		console.warn('exit ->', process.pid)
	}

}


