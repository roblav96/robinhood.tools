// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as common from '../../common'

import * as Nats from 'nats'
import * as ws from 'uws'
import * as prettyhrtime from 'pretty-hrtime'
import * as microtime from 'microtime'
import * as Benchmark from 'benchmark'
import * as ee3 from 'eventemitter3'



if (process.MASTER) {

	const wss = new ws.Server({ port: (process.PORT - 1) })
	wss.on('error', function(error) { console.error('wss Error >', error) })

	wss.on('connection', function(client) {
		client.on('message', function(message: string) {
			client.send(message)
		})
	})

}



if (process.WORKER) {

	const suite = new Benchmark.Suite('Which one? IDK! :O')



	const socket = new ws('ws://localhost:' + (process.PORT - 1))
	socket.on('close', function(code, message) { console.warn('close', code, message) })
	socket.on('error', function(error) { console.error('socket Error >', error) })

	const wsEE3 = new ee3.EventEmitter()
	socket.on('message', function(data) {
		wsEE3.emit('message', data)
	})

	suite.add('uWebSockets', {
		defer: true,
		fn: function(next) {
			socket.send(Date.now().toString())
			wsEE3.once('message', function(data) {
				next.resolve(data)
			})
		},
	})

	suite.on('cycle', function(event) {
		// console.log('COMPLETE >', event.target.toString())
		console.info('cycle')
		eyes.inspect(event.target.toString())
	})

	socket.on('open', function() {
		console.warn('start')
		suite.run({ async: true, name: 'buttface?' })
	})



}







