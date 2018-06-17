// 

import * as net from 'net'
import * as Mqtt from 'mqtt'
import * as MqttConnection from 'mqtt-connection'
import * as qs from 'querystring'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from './redis'
import * as webull from './webull'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'



type Topics = (keyof typeof webull.mqtt_topics)[]
export default class WebullMqttClient {

	private static topics = {
		STOCKS: ['TICKER', 'TICKER_DEAL_DETAILS', 'TICKER_BID_ASK', 'TICKER_HANDICAP', 'TICKER_STATUS'] as Topics,
		INDEXES: ['TICKER_MARKET_INDEX', 'FOREIGN_EXCHANGE', 'TICKER_BID_ASK', 'TICKER_HANDICAP', 'TICKER_STATUS'] as Topics,
		FOREX: ['FOREIGN_EXCHANGE', 'TICKER_BID_ASK', 'TICKER_HANDICAP', 'TICKER_STATUS'] as Topics,
	}

	private static get options() {
		return _.clone({
			fsymbols: null as Dict<number>,
			topics: '' as keyof typeof WebullMqttClient.topics,
			heartbeat: '10s' as Clock.Tick,
			host: 'push.webull.com', port: 9018,
			verbose: false,
		})
	}

	constructor(
		private options = {} as Partial<typeof WebullMqttClient.options>,
		private emitter: Emitter,
	) {
		_.defaults(this.options, WebullMqttClient.options)
		this.reconnect()
	}

	alive = false
	dsymbols: Dict<string>
	client: MqttConnection

	private nextId() { return _.random(111, 999) }

	destroy() {
		this.terminate()
		clock.offListener(this.reconnect, this)
	}

	terminate() {
		this.alive = false
		if (this.client) {
			this.client.destroy()
			this.client.removeAllListeners()
			this.client = null
		}
	}

	private timeout: NodeJS.Timer
	private ontimeout = () => this.connect()
	private reconnect() {
		if (this.alive) {
			this.alive = false
			this.client.pingreq()
			return
		}
		clearTimeout(this.timeout)
		let ms = 300 + _.random(0, +process.env.SCALE * 300)
		this.timeout = setTimeout(this.ontimeout, ms)
	}

	private connect() {
		// if (this.alive) return;
		this.terminate()
		this.client = new MqttConnection(net.createConnection(this.options.port, this.options.host))
		this.client.connect({
			username: process.env.WEBULL_DID,
			password: process.env.WEBULL_TOKEN,
			clientId: 'mqtt_' + this.nextId(),
			protocolId: 'MQTT',
			protocolVersion: 4,
			keepalive: 60,
			clean: true,
		})
		this.client.on('data', this.ondata)
		this.client.on('close', this.onclose)
		this.client.on('error', this.onerror)
		if (!clock.hasListener(this.reconnect, this)) {
			clock.on(this.options.heartbeat, this.reconnect, this)
		} else console.log('reconnecting...');
	}

	private ondata = (packet: Mqtt.Packet) => {

		if (packet.cmd == 'pingresp') {
			// if (this.options.verbose) console.log('pong');
			this.alive = true
			return
		}

		if (packet.cmd == 'connack') {
			if (this.options.verbose) console.info('connect');
			this.alive = true

			// {
			// 	let topic = {
			// 		regionIds: [6],
			// 		header: {
			// 			app: 'stocks',
			// 			did: process.env.WEBULL_DID,
			// 			access_token: process.env.WEBULL_TOKEN,
			// 		},
			// 	}
			// 	let others = [1, 2, 3, 4, 11, 16]
			// 	let subscriptions = others.map(other => ({
			// 		topic: JSON.stringify(Object.assign(topic, { type: other.toString() })), qos: 0,
			// 	}))
			// 	console.log(`subscriptions ->`, subscriptions)
			// 	this.client.subscribe({ subscriptions, messageId: this.nextId() })
			// }
			// return

			this.dsymbols = _.invert(_.mapValues(this.options.fsymbols, v => v.toString()))
			let topic = {
				tickerIds: Object.values(this.options.fsymbols),
				header: {
					app: 'stocks',
					did: process.env.WEBULL_DID,
					access_token: process.env.WEBULL_TOKEN,
				},
			}
			let topics = Object.keys(webull.mqtt_topics).filter(v => !isNaN(v as any))
			if (this.options.topics) {
				topics = WebullMqttClient.topics[this.options.topics].map(v => webull.mqtt_topics[v].toString())
			}

			let subscriptions = topics.map(type => ({
				topic: JSON.stringify(Object.assign(topic, { type })), qos: 0,
			}))
			this.client.subscribe({ subscriptions, messageId: this.nextId() })

			return
		}

		if (packet.cmd == 'suback') {
			// if (this.options.verbose) console.info('subscribed');
			this.client.pingreq()
			return
		}

		if (packet.cmd == 'disconnect') {
			if (this.options.verbose) console.warn('disconnect');
			this.alive = false
			// this.destroy()
			return
		}

		if (packet.cmd == 'publish') {
			let topic = (qs.parse(packet.topic) as any) as Webull.Mqtt.Topic
			let payload = JSON.parse(packet.payload.toString()) as Webull.Mqtt.Payload<Webull.Quote>

			let type = Number.parseInt(topic.type)
			if (type == webull.mqtt_topics.TICKER_BID_ASK) {
				payload.data.remove(v => {
					delete v.countryISOCode
					delete v.tradeTime
					return !(
						(Array.isArray(v.bidList) && v.bidList.length > 0)
						||
						(Array.isArray(v.askList) && v.askList.length > 0)
					)
				})
			}
			if (payload.data.length == 0) return;

			let tid = Number.parseInt(topic.tid)
			let symbol = this.dsymbols[topic.tid]

			if (!symbol) {
				console.warn(tid, `!symbol`)
				return redis.main.hget(rkeys.WB.TIDS, topic.tid).then(symbol => {
					this.dsymbols[topic.tid] = symbol
				})
			}

			let i: number, len = payload.data.length
			for (i = 0; i < len; i++) {
				let wbdata = payload.data[i]
				if (wbdata) {
					webull.fix(wbdata)
					wbdata.tickerId = tid
					wbdata.symbol = symbol
					this.emitter.emit('data', type, wbdata)
				}
			}

			return
		}

		console.warn('ondata packet ->', packet)

	}

	private onclose = reason => {
		console.warn('onclose ->', reason)
		this.alive = false
	}

	private onerror = (error: Error) => {
		console.error('onerror Error ->', error)
		this.alive = false
	}

}


