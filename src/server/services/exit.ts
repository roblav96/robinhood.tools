// 

import Emitter from '../../common/emitter'



class Exit extends Emitter {
	constructor() {
		super()
	}
}

const exit = new Exit()
export default exit



process.on('beforeExit', function(message) {
	console.log('beforeExit ->', message)
})

process.on('exit', function(message) {
	console.log('exit ->', message)
})

process.on('SIGINT', function(message) {
	console.log('SIGINT ->', message)
	process.exit(1)
})

process.on('SIGTERM', function(message) {
	console.log('SIGTERM ->', message)
	process.exit(1)
})

// tsc-watch
process.on('SIGUSR2', function(message) {
	console.log('SIGUSR2 ->', message)
	process.exit(1)
})


