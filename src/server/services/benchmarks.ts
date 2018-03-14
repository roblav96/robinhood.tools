// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as common from '../../common'

import * as Nats from 'nats'
import * as Uws from 'uws'
import * as prettyhrtime from 'pretty-hrtime'
import * as microtime from 'microtime'
import * as Benchmark from 'benchmark'
import * as ee3 from 'eventemitter3'



if (process.MASTER) {

	const nats = Nats.connect(process.PORT)
	nats.on('error', function(error) { console.error('nats Error >', error) })
	nats.subscribe('message', function(data) {
		nats.publish('message', data)
	})

}



if (process.WORKER) {

	const suite = new Benchmark.Suite('Which one? IDK! :O')



	const nats = Nats.connect(process.PORT)
	nats.on('error', function(error) { console.error('nats Error >', error) })

	const natsEE3 = new ee3.EventEmitter()
	nats.subscribe('message', function(data) {
		natsEE3.emit('message', data)
	})

	suite.add('NATS', {
		defer: true,
		fn: function(next) {
			nats.publish('message', Date.now().toString())
			natsEE3.once('message', function(data) {
				next.resolve(data)
			})
		},
	})

	suite.on('cycle', function(event) {
		nats.close()
		console.info('cycle')
		eyes.inspect(event.target.toString())
	})

	nats.on('connect', function() {
		console.warn('start')
		suite.run({ async: true })
	})

























	// const wss = new Uws.Server({ port: (process.PORT - 1) })
	// wss.on('error', function(error) { console.error('wss Error >', error) })
	// wss.on('connection', function(client) {
	// 	client.on('message', function(message: string) {
	// 		client.send(message)
	// 	})
	// })



	// const socket = new Uws('ws://localhost:' + (process.PORT - 1))
	// socket.on('close', function(code, message) { console.warn('close', code, message) })
	// socket.on('error', function(error) { console.error('socket Error >', error) })

	// const uwsEE3 = new ee3.EventEmitter()
	// socket.on('message', function(data) {
	// 	uwsEE3.emit('message', data)
	// })

	// suite.add('uWebSockets', {
	// 	defer: true,
	// 	fn: function(next) {
	// 		socket.send(Date.now().toString())
	// 		uwsEE3.once('message', function(data) {
	// 			next.resolve(data)
	// 		})
	// 	},
	// })

	// suite.on('cycle', function(event) {
	// 	socket.close()
	// 	console.info('cycle')
	// 	eyes.inspect(event.target.toString())
	// })

	// socket.on('open', function() {
	// 	console.warn('start')
	// 	suite.run({ async: true })
	// })



}







