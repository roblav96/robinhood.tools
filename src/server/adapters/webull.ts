// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as common from '../../common'
import * as utils from '../services/utils'

import * as qs from 'querystring'
import * as mqtt from 'mqtt'
import * as redis from './redis'
// import gun from './gun'
import wss from './wss'



async function start() {
	let rkey = 'rh:symbols:full' + ':16:' + process.INSTANCE
	let fsymbols = await <any>redis.main.get(rkey) as any[]
	fsymbols = common.json.parse(fsymbols)
	fsymbols = fsymbols.map(v => ({ symbol: v[0], tickerid: v[1] }))

	fsymbols = common.array.chunks(common.DEV_SYMBOLS, process.INSTANCES)[process.INSTANCE]

	const sdict = {} as { [tickerid: number]: string }
	const tids = [] as Array<number>

	fsymbols.forEach(function(v) {
		sdict[v.tickerid] = v.symbol
		tids.push(v.tickerid)
	})

	const wbdid = 'da8f34f200464e3c95100ee2c2eb8735' // '230f3935a9e64e428c789f0ba4899552'
	const wbtoken = '161cadbb19b-d63f5d1679db41d8a510b741bfebd02f' // '15f3a858c99-39cdfddfaf154ac8b4cc4fd6b962135c'

	const client = mqtt.connect(null, {
		protocol: 'tcp',
		host: 'push.webull.com',
		port: 9018,
		username: wbdid,
		password: wbtoken,
		keepalive: 60,
	})

	client.on('error', function(error) {
		console.error('mqtt Error >', error)
	})

	client.on('connect', function() {
		console.info('mqtt connected', fsymbols.length)
		console.log('fsymbols >', fsymbols.length)
		// eyes.inspect(fsymbols, 'fsymbols')
		
		let topic = {
			tickerIds: tids,
			header: { did: wbdid, access_token: wbtoken, hl: 'en', locale: 'eng', os: 'android', osv: 'Android SDK: 25 (7.1.2)', ph: 'Google Pixel', ch: 'google_play', tz: 'America/New_York', ver: '3.5.1.13', app: 'stocks' },
		}
		client.subscribe(JSON.stringify(Object.assign(topic, { type: '5' }))) // TICKER
		client.subscribe(JSON.stringify(Object.assign(topic, { type: '6' }))) // TICKER_DETAIL
		client.subscribe(JSON.stringify(Object.assign(topic, { type: '12' }))) // TICKER_STATUS
		client.subscribe(JSON.stringify(Object.assign(topic, { type: '13' }))) // TICKER_HANDICAP
		client.subscribe(JSON.stringify(Object.assign(topic, { type: '14' }))) // TICKER_BID_ASK
		client.subscribe(JSON.stringify(Object.assign(topic, { type: '15' }))) // TICKER_DEAL_DETAILS
		
	})

	client.on('message', function(topic: any, message: any) {
		topic = qs.parse(topic) as any
		topic.tid = Number.parseInt(topic.tid)
		message = common.json.parse(message.toString())
		if (!message || !Array.isArray(message.data)) return;
		if (message.data.length == 0) return;

		message.data.forEach(function(wquote) {
			fixQuote(wquote)
			wquote.tickerId = topic.tid
			wquote.symbol = sdict[topic.tid]

			// console.info('wquote >')
			// eyes.inspect(wquote)
			
			wss.emit('quotes/' + wquote.symbol, wquote)

			// gun.get('quotes/' + wquote.symbol).put(wquote)
			// let result = gun.get('quotes/' + wquote.symbol).put(wquote)
			// console.log('result >', result)

		})

	})

}
start().catch(error => console.error('start Error >', error))



function fixQuote(wquote: any) {
	common.object.fix(wquote)
	if (Array.isArray(wquote.bidList) && wquote.bidList.length > 0) {
		wquote.bidList.forEach(v => common.object.fix(v))
		wquote.bid = _.mean(_.compact(wquote.bidList.map(v => v.price)))
		wquote.bidSize = _.sum(wquote.bidList.map(v => v.volume).concat(0))
	}
	_.unset(wquote, 'bidList')
	if (Array.isArray(wquote.askList) && wquote.askList.length > 0) {
		wquote.askList.forEach(v => common.object.fix(v))
		wquote.ask = _.mean(_.compact(wquote.askList.map(v => v.price)))
		wquote.askSize = _.sum(wquote.askList.map(v => v.volume).concat(0))
	}
	_.unset(wquote, 'askList')
}





