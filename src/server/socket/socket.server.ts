// 

import * as _ from '../../common/lodash'
import * as Sockette from 'sockette'
import * as os from 'os'
import * as http from 'http'
import * as turbo from 'turbo-http'
import * as uws from 'uws'
import WebSocketClient from '../../common/websocket.client'
import WebSocketServer from '../adapters/websocket.server'



export const server = http.createServer()
export const wss = new WebSocketServer({ server })

wss.on('error', function(error) { console.error('wss.on Error ->', error) })

wss.on('connection', function(client) {
	console.log('client ->', client)
	client.send('welcome')
})



setTimeout(function() {
	let port = +process.env.PORT + os.cpus().length
	let address = 'ws://' + process.env.HOST + ':' + port
	let ws = new WebSocketClient(address)
	ws.on('open', function() {
		console.log('opened')
	})
}, 1000)


