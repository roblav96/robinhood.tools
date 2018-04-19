// 

import * as net from 'net'
import * as Mqtt from 'mqtt'
import * as MqttConnection from 'mqtt-connection'
import * as qs from 'querystring'
import * as core from '../../common/core'
import * as http from '../adapters/http'
import * as redis from '../adapters/redis'
import * as webull from '../adapters/webull'
import * as rhinstruments from './robinhood.instruments'
import radio from '../adapters/radio'



// rhinstruments.rxready.subscribe(function() {
onLiveTickers().catch(function(error) {
	console.error('onLiveTickers Error ->', error)
})
// })



radio.on(onLiveTickers.name, onLiveTickers)
async function onLiveTickers() {
	if (process.WORKER) return;

	// let resolved = (await redis.main.get(`${redis.SYMBOLS.STOCKS}:${process.INSTANCES}:${process.INSTANCE}`) as any) as Dict<number>
	// resolved = JSON.parse(resolved as any)
	// let symbols = Object.keys(resolved)
	// let tickerIds = Object.values(resolved)

	let cryptos = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/8', {
		query: {}
	}) as Webull.API.TupleArrayList<Webull.Ticker>[]
	let tickerIds = cryptos[0].tickerTupleArrayList.map(v => v.tickerId)
	console.log('tickerIds.length ->', tickerIds.length)



	let mqtt = new webull.WebullMqtt(tickerIds, { verbose: true })
	mqtt.on('message', function(packet: Mqtt.Packet) {

	})


	// let socket = net.connect(9018, 'push.webull.com')
	// let client = new MqttConnection(socket)

	// client.connect({
	// 	clientId: 'mqtt_' + Math.random().toString(),
	// 	protocolId: 'MQTT',
	// 	protocolVersion: 4,
	// 	keepalive: 60,
	// 	clean: true,
	// 	username: process.env.WEBULL_DID,
	// 	password: process.env.WEBULL_TOKEN,
	// })

	// client.on('data', function(packet: Mqtt.Packet) {

	// 	if (packet.cmd == 'connack') {
	// 		let topic = {
	// 			tickerIds, type: '',
	// 			header: {
	// 				app: 'desktop',
	// 				did: process.env.WEBULL_DID,
	// 				access_token: process.env.WEBULL_TOKEN,
	// 			},
	// 		}
	// 		client.subscribe({
	// 			messageId: packet.returnCode,
	// 			subscriptions: [{
	// 				topic: JSON.stringify(Object.assign(topic, { type: '5' })),
	// 				qos: 0,
	// 			}],
	// 		})
	// 		return
	// 	}

	// 	if (packet.cmd == 'publish') {
	// 		let message = JSON.parse(packet.payload.toString())
	// 		return
	// 	}

	// 	console.log('client packet ->', packet)

	// })

	// client.on('close', function(reason) {
	// 	console.warn('client close ->', reason)
	// 	client.destroy()
	// })
	// client.on('error', function(error) {
	// 	console.error('client Error ->', error)
	// 	client.destroy()
	// })
	// client.on('disconnect', function(reason) {
	// 	console.warn('client disconnect ->', reason)
	// 	client.destroy()
	// })

	// client.on('connack', function(packet) {
	// 	console.log('client connack ->', packet)
	// 	// client.connack({ returnCode: packet.returnCode })
	// })

	// client.on('connect', function(packet) {
	// 	console.log('client connect ->', packet)
	// 	// client.connack({ returnCode: 0 })
	// })

	// client.on('data', function(packet: Mqtt.Packet) {
	// 	console.log('client data ->', packet)
	// })
	// // client.on('message', function(packet) {
	// // 	console.log('client message ->', packet)
	// // })

	// client.on('publish', function(packet) {
	// 	console.log('client publish ->', packet)
	// })
	// client.on('puback', function(packet) {
	// 	console.log('client puback ->', packet)
	// })
	// client.on('pubrec', function(packet) {
	// 	console.log('client pubrec ->', packet)
	// })
	// client.on('pubrel', function(packet) {
	// 	console.log('client pubrel ->', packet)
	// })
	// client.on('pubcomp', function(packet) {
	// 	console.log('client pubcomp ->', packet)
	// })
	// client.on('suback', function(packet) {
	// 	console.log('client suback ->', packet)
	// })

	// client.on('pingreq', function(packet) {
	// 	console.log('client pingreq ->', packet)
	// 	// client.pingresp()
	// })
	// client.on('pingresp', function(packet) {
	// 	console.log('client pingresp ->', packet)
	// 	// client.pingresp()
	// })

	// client.on('subscribe', function(packet) {
	// 	console.log('client subscribe ->', packet)
	// 	// client.suback({ granted: [packet.qos], messageId: packet.messageId })
	// })





	// const client = Mqtt.connect(null, {
	// 	host: 'push.webull.com',
	// 	port: 9018,
	// 	username: process.env.WEBULL_DID,
	// 	password: process.env.WEBULL_TOKEN,
	// })

	// client.on('close', function(reason) {
	// 	console.warn('client close ->', reason)
	// })
	// client.on('error', function(error) {
	// 	console.error('client Error ->', error)
	// })

	// client.on('connect', function() {
	// 	console.log('client connect')
	// 	let topic = {
	// 		tickerIds,
	// 		header: {
	// 			did: process.env.WEBULL_DID,
	// 			access_token: process.env.WEBULL_TOKEN,
	// 			app: 'desktop'
	// 			// hl: 'en', locale: 'eng', os: 'android', osv: 'Android SDK: 25 (7.1.2)', ph: 'Google Pixel', ch: 'google_play', tz: 'America/New_York', ver: '3.5.1.13',
	// 		},
	// 		type: '',
	// 	}
	// 	client.subscribe(JSON.stringify(Object.assign(topic, { type: '5' }))) // TICKER
	// 	// client.subscribe(JSON.stringify(Object.assign(topic, { type: '6' }))) // TICKER_DETAIL
	// 	// client.subscribe(JSON.stringify(Object.assign(topic, { type: '12' }))) // TICKER_STATUS
	// 	// client.subscribe(JSON.stringify(Object.assign(topic, { type: '13' }))) // TICKER_HANDICAP
	// 	// client.subscribe(JSON.stringify(Object.assign(topic, { type: '14' }))) // TICKER_BID_ASK
	// 	// client.subscribe(JSON.stringify(Object.assign(topic, { type: '15' }))) // TICKER_DEAL_DETAILS
	// })

	// client.on('message', function(query, buffer) {
	// 	let topic = (qs.parse(query) as any) as Webull.Mqtt.Topic
	// 	topic.tid = Number.parseInt(topic.tid as any)
	// 	console.log('topic ->', topic)

	// 	let message = core.json.parse(buffer.toString()) as any
	// 	console.log('message.data ->', message.data)

	// })



}







// let response = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/3/foreignExchanges/1', {
// 	query: { regionIds: '1', hl: 'en', }
// }) as Webull.Ticker[]
// let tickerIds = response.map(v => v.tickerId)
// console.log('tickerIds.length ->', tickerIds.length)

// let response = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/8', {
// 	query: {}
// }) as Webull.API.TupleArrayList<Webull.Ticker>[]
// let tickerIds = response[0].tickerTupleArrayList.map(v => v.tickerId)
// console.log('tickerIds.length ->', tickerIds.length)


