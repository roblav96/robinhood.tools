// 

import * as inspector from 'inspector'
inspector.open(process.debugPort + Math.round(Math.random() * 10))

import { Server as TurboServer } from 'turbo-http'
import * as TurboRequest from 'turbo-http/lib/request'
import * as TurboResponse from 'turbo-http/lib/response'
import * as turbo from 'turbo-http'
import * as Polka from 'polka'
import * as _ from 'lodash'



const polka = Polka<TurboServer, TurboRequest, TurboResponse>({

})

const server = turbo.createServer(polka.handler)
server.listen(_.random(8000, 9000), process.env.HOST, () => {
	let address = server.address()
	console.info('api listening ->', address.port)
	process.send('ready')
})

polka.get('/', (req, res) => {
	res.end('OK')
})

process.on('SIGINT', () => require('cluster').worker.disconnect())



// setTimeout(function() {
// 	console.log(`execa.shellSync ->`)
// 	execa.shellSync('final-pm --kill')
// }, 3000)



// import * as execa from 'execa'
// function killit() { execa.shellSync('final-pm --kill') }

// setInterval(function () {
// 	let stdout = (console as any)._stdout
// 	console.log(`stdout.isTTY ->`, stdout.isTTY)
// 	// console.log(`process.stdin.isTTY ->`, process.stdin.isTTY)
// 	// console.log(`process.stdout.isTTY ->`, process.stdout.isTTY)
// 	// console.log(`process.stderr.isTTY ->`, process.stderr.isTTY)
// },1000)

// process.on('SIGINT', () => {
// 	console.log('SIGINT ->', process.pid)
// 	killit()
// })

// import * as exithook from 'exit-hook'
// exithook(function() {
// 	console.log('exithook ->', process.pid)
// 	killit()
// })

// import * as sigexit from 'signal-exit'
// sigexit(function(code, signal) {
// 	console.log('sigexit ->', process.pid)
// 	killit()
// })

// import * as fkill from 'fkill'
// return fkill(process.pid, { force: true, tree: true })

// process.on('SIGINT', function (signal) {
// 	console.log(`polka SIGINT`)
// })

// // let ii = 0
// setTimeout(function() {
// 	// console.log(`ii++ ->`, ii++)
// 	// console.log(`setTimeout`)

// 	// console.log(`final ->`, final)

// 	// let url = 'ws+unix:///Users/roblav96/.final-pm/daemon.sock'
// 	// final.client.connect(url).then(function(client: Client) {
// 	// 	console.log(`client ->`, client)
// 	// 	client.send('SIGKILL')
// 	// }).catch(function(error) {
// 	// 	console.error(`client.connect Error -> %O`, error)
// 	// })

// }, 1000)

