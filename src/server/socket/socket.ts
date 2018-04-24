// 

import '../main'
import { ServiceContextAccessor } from 'pandora/dist/service/ServiceContextAccessor'
import * as pandora from 'pandora'
import * as os from 'os'



export default class Api {

	constructor(public context: ServiceContextAccessor) {

	}

	async start() {
		await polka.listen(+process.env.PORT, process.env.HOST)
		console.info('listening ->', process.env.PORT)
	}

	async stop() {
		console.log('stop ->', process.pid)
		process.emit('beforeExit', 0)
		// socket.wss.close()
		// socket.server.close()
		polka.server.connections.forEach(v => v.close())
		await new Promise(resolve => {
			polka.server.close(resolve)
		})
		console.warn('exit ->', process.pid)
		// process.kill(process.pid)
	}

}


