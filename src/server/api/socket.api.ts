// 

import * as _ from '../../common/lodash'
import * as Sockette from 'sockette'
import * as http from 'http'
import * as turbo from 'turbo-http'
import * as uws from 'uws'

const clusterws = require('clusterws/dist')
const WebSocketClient = clusterws.uWebSocket
const WebSocketServer = clusterws.uWebSocketServer

// console.log('uws.http ->', uws.http)
// console.dir(uws.http)

// export const server = http.createServer()
// export const server = turbo.createServer(function(req, res) {
export const server = uws.http.createServer(function(req, res) {
	console.log('!!req ->', !!req)
	console.log('req.method ->', req.method)
	// console.log('req.headers ->', req.headers)
	// let type = req.headers['upgrade']
	// if (type == 'websocket') {
	// 	console.log('type ->', type)
	// 	server.emit('upgrade', req, req.socket)
	// 	return
	// }
	res.end(Buffer.from('hello world'))
	// 	// console.log('req.headers ->', req.headers)
	// 	// console.log('res ->', res)
	// 	if (req.method === 'POST') {
	// 		var postString = '';
	// 		req.on('data', (arrayBuffer) => {
	// 			postString += Buffer.from(arrayBuffer).toString();
	// 		}).on('end', () => {
	// 			res.end('You posted me this: ' + postString);
	// 		});
	// 		// handle some GET url
	// 	} else if (req.url === '/') {
	// 		res.end(Buffer.from('hello world'))
	// 	} else {
	// 		res.end('Unknown request by: ' + req.headers['user-agent']);
	// 	}
})



export const wss = new uws.Server({ server })

wss.on('error', function(error) { console.error('wss.on Error ->', error) })

wss.on('connection', function(client) {
	console.log('wss.on !!client ->', !!client)
	client.send('welcome')
})



setTimeout(function() {
	let address = 'ws://' + process.env.HOST + ':' + (+process.env.PORT + 2)
	var ws = new uws(address);
	ws.on('open', function open() {
		console.log('Connected!');
		ws.send('This will be sent!');
	});
	ws.on('error', function error() {
		console.error('Error connecting!');
	});
	ws.on('message', function(data, flags) {
		console.log('Message: ' + data);
	});
	ws.on('close', function(code, message) {
		console.warn('Disconnection: ' + code + ', ' + message);
	});
	// console.log('address ->', address)
	// const ws = new Sockette(address, {
	// 	timeout: 5e3,
	// 	maxAttempts: 10,
	// 	onopen: e => console.log('Connected!', e),
	// 	onmessage: e => console.log('Received:', e),
	// 	onreconnect: e => console.log('Reconnecting...', e),
	// 	onmaximum: e => console.log('Stop Attempting!', e),
	// 	onclose: e => console.log('Closed!', e),
	// 	onerror: e => console.log('Error:', e)
	// })
}, 1000)


