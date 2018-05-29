// 

import * as net from 'net'
import * as Mqtt from 'mqtt'
import * as MqttConnection from 'mqtt-connection'
import * as qs from 'querystring'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as webull from './webull'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'



export class MqttClient {

	private static topics = {
		// STOCKS: ['COMMODITY', 'FOREIGN_EXCHANGE', 'TICKER', 'TICKER_BID_ASK', 'TICKER_DEAL_DETAILS', 'TICKER_HANDICAP', 'TICKER_MARKET_INDEX', 'TICKER_STATUS'] as KeysOf<typeof webull.mqtt_topics>,
		STOCKS: ['TICKER', 'TICKER_DETAIL', 'TICKER_DEAL_DETAILS', 'TICKER_BID_ASK', 'TICKER_HANDICAP', 'TICKER_STATUS'] as KeysOf<typeof webull.mqtt_topics>,
		FOREX: ['FOREIGN_EXCHANGE', 'TICKER_BID_ASK', 'TICKER_HANDICAP', 'TICKER_STATUS'] as KeysOf<typeof webull.mqtt_topics>,
		INDEXES: ['TICKER_MARKET_INDEX', 'FOREIGN_EXCHANGE', 'TICKER_BID_ASK', 'TICKER_HANDICAP', 'TICKER_STATUS'] as KeysOf<typeof webull.mqtt_topics>,
	}

	private static get options() {
		return _.clone({
			fsymbols: null as Dict<number>,
			topics: null as keyof typeof MqttClient.topics,
			index: 0, chunks: 1,
			host: 'push.webull.com', port: 9018,
			timeout: '10s' as Clock.Tick,
			connect: true,
			retry: true,
			verbose: false,
		})
	}

	get name() { return 'mqtt://' + this.options.host + ':' + this.options.port }

	constructor(
		public options = {} as Partial<typeof MqttClient.options>,
		private emitter: Emitter,
	) {
		_.defaults(this.options, MqttClient.options)
		if (this.options.connect) this.connect();
	}

	started = false
	connected = false
	dsymbols: Dict<string>
	client: MqttConnection

	private nextId() { return core.math.random(1, 999) }

	destroy() {
		this.terminate()
		clock.offListener(this.reconnect, this)
	}

	terminate() {
		this.connected = false
		if (this.client) {
			this.client.end()
			this.client.destroy()
			this.client.removeAllListeners()
			this.client = null
		}
	}

	private ontimeout = () => this.connect()
	private reconnect() {
		if (this.connected == true) {
			this.connected = false
			this.client.pingreq()
		}
		let multiplier = this.options.chunks == 1 ? core.math.random(1000, 3000) : 1000
		let ms = core.math.dispersed(this.options.chunks * multiplier, this.options.index + 1, this.options.chunks)
		_.delay(this.ontimeout, ms)
	}
	connect() {
		if (this.connected == true) return;
		this.terminate()
		this.client = new MqttConnection(net.connect(this.options.port, this.options.host))
		this.client.connect({
			username: process.env.WEBULL_DID,
			password: process.env.WEBULL_TOKEN,
			clientId: 'mqtt_' + Math.random().toString(),
			protocolId: 'MQTT',
			protocolVersion: 4,
			keepalive: 30,
			clean: true,
		})
		this.client.on('data', this.ondata)
		this.client.on('error', this.onerror)
		if (this.started == false) {
			this.started = true
			if (this.options.retry) {
				clock.on(this.options.timeout, this.reconnect, this)
			}
		} else {
			console.log('started connect ->', this.options.index, 'connected ->', this.connected)
		}
	}

	private ondata = (packet: Mqtt.Packet) => {

		if (packet.cmd == 'pingresp') {
			this.connected = true
			return
		}

		if (packet.cmd == 'connack') {
			if (this.options.verbose) console.info(this.name, '-> connect');
			this.connected = true
			this.emitter.emit('connect', this.options.index)

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
				topics = MqttClient.topics[this.options.topics].map(v => webull.mqtt_topics[v].toString())
			}

			let subscriptions = topics.map(type => ({
				topic: JSON.stringify(Object.assign(topic, { type })), qos: 0,
			}))
			this.client.subscribe({ subscriptions, messageId: this.nextId() })

			return
		}

		if (packet.cmd == 'suback') {
			this.emitter.emit('subscribed', this.options.index)
			return
		}

		if (packet.cmd == 'disconnect') {
			if (this.options.verbose) console.warn(this.name, '-> disconnect');
			this.connected = false
			this.emitter.emit('disconnect', this.options.index)
			this.destroy()
		}

		if (packet.cmd == 'publish') {
			let topic = (qs.parse(packet.topic) as any) as Webull.Mqtt.Topic
			let payload = JSON.parse(packet.payload.toString()) as Webull.Mqtt.Payload<Webull.Quote>

			let type = Number.parseInt(topic.type)
			if (type == webull.mqtt_topics.TICKER_BID_ASK) {
				payload.data.remove(v => {
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

			let i: number, len = payload.data.length
			for (i = 0; i < len; i++) {
				let wbquote = payload.data[i]
				if (wbquote) {
					webull.fix(wbquote)
					wbquote.tickerId = tid
					wbquote.symbol = symbol
					this.emitter.emit('data', type, wbquote)
				}
			}

			return
		}

		console.warn('ondata packet ->', packet)

	}

	private onerror = (error: Error) => {
		// if (this.options.verbose) console.error(this.name, 'onerror Error ->', error);
		console.error(this.name, 'onerror Error ->', error)
		this.connected = false
	}

}


