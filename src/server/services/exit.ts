// 

import Emitter from '../../common/emitter'



process.on('SIGINT', function() {
	process.kill(process.pid)
})


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


