// 

import * as pAll from 'p-all'
import * as pm2 from 'pm2'
import Emitter from '../../common/emitter'



export default new class Pm2 extends Emitter<string, any> {

	constructor() {
		super()

		process.on('message', message => {
			super.emit(message.topic, ...message.data.args)
		})

	}

	emit(name: string, ...args: any[]) {
		pm2.connect(function(error) {
			if (error) return console.error('pm2.connect Error ->', error);
			pm2.list(function(error, procs) {
				if (error) return console.error('pm2.list Error ->', error);
				let ids = procs.filter(v => v.name == process.NAME).map(v => v.pm_id)
				return Promise.all(ids.map(function(id) {
					return new Promise(function(resolve, reject) {
						pm2.sendDataToProcessId(id, { topic: name, data: { args } }, function(error) {
							if (error) return reject(error);
							resolve()
						})
					})
				})).then(() => pm2.disconnect()).catch(function(error) {
					console.error('pm2.send Error ->', error)
				})
			})
		})
		return this
	}

}


