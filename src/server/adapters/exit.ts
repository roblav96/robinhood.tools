// 

import * as R from '../../common/rambdax'
import * as core from '../../common/core'
import Emitter from '../../common/emitter'



// const exit = new Emitter()
// export default function onexit(fn: () => any) {
// 	exit.once('', fn)
// }





// process.on('SIGINT', function(message) {
// 	console.log('message ->', message)
// 	let xms = 10
// 	let ms = core.math.dispersed(xms * process.INSTANCES, process.INSTANCE, process.INSTANCES)
// 	R.delay(ms + xms).then(() => process.exit(0))
// })



// class PM2 extends Emitter<string, any> {

// 	constructor() {
// 		super()

// 		process.on('message', message => {
// 			super.emit(message.topic, ...message.data.args)
// 		})

// 	}

// 	emit(name: string, ...args: any[]) {
// 		pm2.connect(function(error) {
// 			if (error) return console.error('pm2.connect Error ->', error);
// 			pm2.list(function(error, procs) {
// 				if (error) return console.error('pm2.list Error ->', error);
// 				let ids = procs.filter(v => v.name == process.NAME).map(v => v.pm_id)
// 				return Promise.all(ids.map(function(id) {
// 					return new Promise(function(resolve, reject) {
// 						pm2.sendDataToProcessId(id, { topic: name, data: { args } }, function(error) {
// 							if (error) return reject(error);
// 							resolve()
// 						})
// 					})
// 				})).catch(function(error) {
// 					console.error('pm2.send Error ->', error)
// 				}).finally(() => pm2.disconnect())
// 			})
// 		})
// 		return this
// 	}

// }

// export default new PM2()



// process.on('SIGINT', () => process.kill(process.pid))

// process.on('SIGINT', function() {
// 	process.kill(process.pid)
// })


// const emitter = new Emitter()

// export function register(name: string, fn: (done: string) => any) {
// 	emitter.on(fn.name, fn)
// }

// export function done(done: string) {
// 	emitter.emit(done)
// }

// process.on('SIGINT', function() {
// 	process.kill(process.pid)
// 	// Promise.all(emitter.names().map(function(name) {
// 	// 	let prom = emitter.toPromise(name)
// 	// 	emitter.emit(name, name)
// 	// 	return prom
// 	// })).then(function() {
// 	// 	console.warn('process.exit(0)')
// 	// 	process.exit(0)
// 	// }).catch(function(error) {
// 	// 	console.error('process.on SIGINT Error ->', error)
// 	// 	process.exit(1)
// 	// })
// })





// class Exit extends Emitter {

// 	constructor() {
// 		super()

// 		process.on('SIGINT', () => {
// 			let proms = Promise.all(this.names().map(v => this.toPromise(v)))
// 			this.emit('')
// 			proms.then(function() {
// 				process.exit(0)
// 			}).catch(function(error) {
// 				console.error('process.on SIGINT Error ->', error)
// 				process.exit(1)
// 			})
// 		})

// 	}

// }

// const exit = new Exit()
// export default exit



// process.on('beforeExit', function(message) {
// 	console.log('beforeExit ->', message)
// })

// process.on('exit', function(message) {
// 	console.log('exit ->', message)
// })

// process.on('SIGINT', function(message) {
// 	console.log('SIGINT ->', message)
// 	process.exit(1)
// })

// process.on('SIGTERM', function(message) {
// 	console.log('SIGTERM ->', message)
// 	process.exit(1)
// })

// // tsc-watch
// process.on('SIGUSR2', function(message) {
// 	console.log('SIGUSR2 ->', message)
// 	process.exit(1)
// })


