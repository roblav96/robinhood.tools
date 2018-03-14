// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as common from '../../common'

import * as Nats from 'nats'
import * as uws from 'uws'
import * as prettyhrtime from 'pretty-hrtime'
import * as microtime from 'microtime'
import * as benchmark from 'benchmark'



if (process.MASTER) {

	const server = new uws.Server({ port: process.PORT })

	server.on('connection', function(client) {
		console.info('client >')
		eyes.inspect(client)
		client.on('message', function(message: string) {
			console.log('message >', message)
			console.info('message >'); eyes.inspect(message)
			console.info('message >'); eyes.inspect(message)
			// client.send(message)
			client.send(message, { binary: true })
		})
	})

	server.on('error', function(error) {
		console.error('uws.Server error >', error)
	})

} else {

	const client = new uws('ws://localhost:' + process.PORT)
	client.on('open', function() {
		console.warn('open')
	})

	// function cycle(index: number) {
	// 	client.send(index)
	// }
	// if (process.WORKER) {
	// 	cycle(0)
	// }

}







