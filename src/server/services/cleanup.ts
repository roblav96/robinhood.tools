// 

import * as Rx from '../../common/rxjs'



process.on('SIGINT', function(message) {
	console.log('SIGINT ->', message)
	process.exit(0)
})

process.on('SIGTERM', function(message) {
	console.log('SIGTERM ->', message)
	process.exit(0)
})



// process.on('message', function(message) {
// 	console.log('process message ->', message)
// })

// process.on('SIGKILL', function(message) {
// 	console.log('process SIGKILL ->', message)
// })

// process.on('SIGSTOP', function(message) {
// 	console.log('process SIGSTOP ->', message)
// })


