// 

import * as Mqtt from 'mqtt'
import * as qs from 'querystring'
import * as core from '../../common/core'
import * as http from '../adapters/http'
import * as redis from '../adapters/redis'
import * as webull from '../adapters/webull'
import * as rhinstruments from './robinhood.instruments'
import radio from '../adapters/radio'



rhinstruments.rxready.subscribe(function() {
	onLiveTickers().catch(function(error) {
		console.error('onLiveTickers Error ->', error)
	})
})



radio.on(onLiveTickers.name, onLiveTickers)
async function onLiveTickers() {
	if (process.WORKER) return;

	let resolved = (await redis.main.get(`${redis.SYMBOLS.STOCKS}:${process.INSTANCES}:${process.INSTANCE}`) as any) as Dict<number>
	resolved = JSON.parse(resolved as any)

	const MAX_CHUNK = 8
	let symbols = Object.keys(resolved).splice(-MAX_CHUNK)
	let tickerIds = Object.values(resolved).splice(-MAX_CHUNK)



	const client = Mqtt.connect(null, {
		host: 'push.webull.com',
		port: 9018,
		username: process.env.WEBULL_DID,
		password: process.env.WEBULL_TOKEN,
	})

	client.on('close', function(reason) {
		console.warn('client close ->', reason)
	})
	client.on('error', function(error) {
		console.error('client Error ->', error)
	})

	client.on('connect', function() {
		console.log('client connect')
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
		client.subscribe(JSON.stringify(Object.assign(topic, { type: '5' }))) // TICKER
		client.subscribe(JSON.stringify(Object.assign(topic, { type: '6' }))) // TICKER_DETAIL
		client.subscribe(JSON.stringify(Object.assign(topic, { type: '10' }))) // FOREIGN_EXCHANGE
		client.subscribe(JSON.stringify(Object.assign(topic, { type: '12' }))) // TICKER_STATUS
		client.subscribe(JSON.stringify(Object.assign(topic, { type: '13' }))) // TICKER_HANDICAP
		client.subscribe(JSON.stringify(Object.assign(topic, { type: '14' }))) // TICKER_BID_ASK
		client.subscribe(JSON.stringify(Object.assign(topic, { type: '15' }))) // TICKER_DEAL_DETAILS
	})

	client.on('message', function(query, buffer) {
		let topic = (qs.parse(query) as any) as Webull.Mqtt.Topic
		topic.tid = Number.parseInt(topic.tid as any)
		console.log('topic ->', topic)

		let message = core.json.parse(buffer.toString()) as any
		console.log('message.data ->', message.data)

	})



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


