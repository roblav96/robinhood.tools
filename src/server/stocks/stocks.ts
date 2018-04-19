// 

import * as net from 'net'
import * as Mqtt from 'mqtt'
import * as MqttConnection from 'mqtt-connection'
import * as qs from 'querystring'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as http from '../adapters/http'
import * as redis from '../adapters/redis'
import * as webull from '../adapters/webull'
import * as rhinstruments from './robinhood.instruments'
import radio from '../adapters/radio'



export const mqtt = new webull.WebullMqtt(null, { connect: false, verbose: true })
mqtt.on('message', function(quote) {
	console.log('quote ->', quote)
})



rhinstruments.rxready.subscribe(onLiveTickers)
radio.on(onLiveTickers.name, onLiveTickers)
async function onLiveTickers() {
	if (process.WORKER) return;

	let fsymbols = (await redis.main.get(`${redis.SYMBOLS.STOCKS}:${process.INSTANCES}:${process.INSTANCE}`) as any) as Dict<number>
	fsymbols = JSON.parse(fsymbols as any)
	// fsymbols = _.fromPairs(_.toPairs(fsymbols).splice(1024))

	// let fsymbols = {} as Dict<number>
	// // // let cryptos = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/8', {
	// // // 	query: {}
	// // // }) as Webull.API.TupleArrayList<Webull.Ticker>[]
	// // // cryptos[0].tickerTupleArrayList.forEach(function(ticker) {
	// let forex = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/3/foreignExchanges/1', {
	// 	query: { regionIds: '1', hl: 'en', }
	// }) as Webull.Ticker[]
	// forex.forEach(function(ticker) {
	// 	fsymbols[ticker.symbol] = ticker.tickerId
	// })

	// console.log('fsymbols ->', fsymbols)
	mqtt.fsymbols = fsymbols
	mqtt.connect()



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


