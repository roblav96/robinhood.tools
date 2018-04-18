// 

import * as net from 'net'
import * as tnet from 'turbo-net'
import * as thttp from 'turbo-http'
import * as Mqtt from 'mqtt'
import * as uws from 'uws'
import * as Connection from 'mqtt-connection'
import * as qs from 'querystring'
import * as core from '../../common/core'
import * as http from '../adapters/http'
import * as redis from '../adapters/redis'
import * as webull from '../adapters/webull'
import * as rhinstruments from './robinhood.instruments'
import WebSocketClient from '../../common/websocket.client'
import radio from '../adapters/radio'



radio.rxready.subscribe(function() {
	onLiveTickers().catch(function(error) {
		console.error('onLiveTickers Error ->', error)
	})
})



radio.on(onLiveTickers.name, onLiveTickers)
async function onLiveTickers() {
	if (process.WORKER) return;

	// let resolved = (await redis.main.get(`${redis.SYMBOLS.STOCKS}:${process.INSTANCES}:${process.INSTANCE}`) as any) as Dict<number>
	// resolved = JSON.parse(resolved as any)

	// const MAX_CHUNK = 8
	// let symbols = Object.keys(resolved).splice(-MAX_CHUNK)
	// let tickerIds = Object.values(resolved).splice(-MAX_CHUNK)



	// let response = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/3/foreignExchanges/1', {
	// 	query: { regionIds: '1', hl: 'en', }
	// }) as Webull.Ticker[]
	// let tickerIds = response.map(v => v.tickerId)
	// console.log('tickerIds.length ->', tickerIds.length)

	let response = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/8', {
		query: {}
	}) as Webull.API.TupleArrayList<Webull.Ticker>[]
	let tickerIds = response[0].tickerTupleArrayList.map(v => v.tickerId)
	console.log('tickerIds.length ->', tickerIds.length)



	// console.log('Connection ->', Connection)
	// console.dir(Connection)
	// const client = Connection(stream)
	// client.connect({
	// 	host: 'push.webull.com', port: 9018,
	// 	username: 'test', // process.env.WEBULL_DID,
	// 	password: 'test', // process.env.WEBULL_TOKEN,
	// }, function(error) {
	// 	if (error) return console.error('client connect Error ->', error);
	// 	console.log('yay!?')
	// })



	// // console.log('tnet ->', tnet)
	// let socket = tnet.connect(9018, 'push.webull.com') as net.Socket & { read: any }
	// // console.log('socket ->', socket)
	// socket.read(Buffer.alloc(1024), function(error, buffer, data) {
	// 	if (error) return console.error('read Error ->', error);
	// 	console.log('buffer ->', buffer.toString('utf-8', 0, data))
	// })

	// socket.on('connect', function(packet) {
	// 	console.log('socket CONNECT ->', packet)
	// 	socket.write(Buffer.from('hello world'))
	// })

	// socket.on('data', function(data) {
	// 	console.log('socket data ->', data.toString())
	// })

	// socket.on('drain', function(reason) {
	// 	console.warn('socket drain ->', reason)
	// })
	// socket.on('close', function(reason) {
	// 	console.warn('socket close ->', reason)
	// })
	// socket.on('error', function(error) {
	// 	console.error('socket Error ->', error)
	// })



	// // socket.on('ready', function(packet) {
	// // 	console.log('socket ready ->', packet)
	// // })
	// socket.on('pingreq', function(packet) {
	// 	console.log('socket pingreq ->', packet)
	// 	// socket.pingresp()
	// })
	// socket.on('connack', function(packet) {
	// 	console.log('socket connack ->', packet)
	// })

	// socket.on('connect', function(packet) {
	// 	console.log('socket CONNECT ->', packet)
	// })
	// socket.on('message', function(topic, message) {
	// 	console.log('socket message ->', topic, message)
	// })

	// socket.on('disconnect', function(problem) {
	// 	console.warn('socket disconnect problem ->', problem)
	// })



	// origin: https://app.webull.com

	const client = Mqtt.connect(null, {
		// protocol: 'tcp',
		host: 'push.webull.com',
		// hostname: 'push.webull.com',
		port: 9018,
		// path: '/mqtt',
		// wsOptions: {
		// 	// protocol: ['mqtt'],
		// 	origin: 'https://app.webull.com',
		// },
		username: process.env.WEBULL_DID,
		password: process.env.WEBULL_TOKEN,
		// reconnectPeriod: 10000,
		// resubscribe: false,
		// keepalive: 60,
		// clean: true,
	})

	client.on('close', function(reason) {
		console.warn('client close ->', reason)
	})
	client.on('error', function(error) {
		console.error('client Error ->', error)
	})

	client.on('connect', function() {
		console.info('connect')
		let topic = {
			tickerIds,
			header: {
				did: process.env.WEBULL_DID,
				access_token: process.env.WEBULL_TOKEN,
				app: 'desktop'
				// hl: 'en', locale: 'eng', os: 'android', osv: 'Android SDK: 25 (7.1.2)', ph: 'Google Pixel', ch: 'google_play', tz: 'America/New_York', ver: '3.5.1.13',
			},
			type: '' // webull.MQTT_TOPICS.FOREIGN_EXCHANGE,
		}
		// console.log('topic ->', topic)
		core.array.create(16).forEach(function(i) {
			client.subscribe(JSON.stringify(Object.assign(topic, { type: i.toString() })))
		})
		// client.subscribe(JSON.stringify(Object.assign(topic, { type: '5' }))) // TICKER
		// client.subscribe(JSON.stringify(Object.assign(topic, { type: '6' }))) // TICKER_DETAIL
		// client.subscribe(JSON.stringify(Object.assign(topic, { type: '10' }))) // FOREIGN_EXCHANGE
		// client.subscribe(JSON.stringify(Object.assign(topic, { type: '12' }))) // TICKER_STATUS
		// client.subscribe(JSON.stringify(Object.assign(topic, { type: '13' }))) // TICKER_HANDICAP
		// client.subscribe(JSON.stringify(Object.assign(topic, { type: '14' }))) // TICKER_BID_ASK
		// client.subscribe(JSON.stringify(Object.assign(topic, { type: '15' }))) // TICKER_DEAL_DETAILS
	})

	client.on('message', function(topic: any, message: any) {
		topic = qs.parse(topic)
		topic.tid = Number.parseInt(topic.tid)
		console.log('topic ->', topic)
		message = core.json.parse(message.toString())
		console.log('message ->', message.data)
	})







	// const client = new Mqtt.MqttClient(function builder(client, opts) {
	// } as any, {
	// 		host: 'push.webull.com', port: 9018,
	// 		username: 'test', // process.env.WEBULL_DID,
	// 		password: 'test', // process.env.WEBULL_TOKEN,
	// 	}
	// )



	// console.log('net ->', net)
	// console.log('tnet ->', tnet)

	// console.log('stream ->', stream)

	// let stream = net.connect({
	// 	host: 'push.webull.com',
	// 	port: 9018,
	// })

	// console.log('net ->', net)
	// let stream = net.connect(9018, 'push.webull.com')
	// console.log('stream ->', stream)



	// const wsc = new WebSocketClient('wss://push.webull.com:9116/mqtt', {
	// 	timeout: '10s',
	// 	heartbeat: null,
	// 	verbose: true,
	// })

	// wsc.on('open', function() {
	// 	console.log('open')
	// })

	// wsc.on('error', function(error) {
	// 	console.error('error Error ->', error)
	// })

	// wsc.on('message', function(message) {
	// 	console.log('message ->', message)
	// })

	// wsc.on('close', function(code, message) {
	// 	console.log('close ->', code, message)
	// })



}


