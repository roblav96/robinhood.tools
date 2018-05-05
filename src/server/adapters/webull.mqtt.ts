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



export class Watcher extends Emitter<'connect' | 'subscribed' | 'disconnect' | 'data', Webull.Quote> {

	private static topics = {
		forex: ['COMMODITY', 'FOREIGN_EXCHANGE', 'TICKER', 'TICKER_BID_ASK', 'TICKER_HANDICAP', 'TICKER_MARKET_INDEX', 'TICKER_STATUS'] as KeysOf<typeof webull.MQTT_TOPICS>,
		stocks: ['COMMODITY', 'FOREIGN_EXCHANGE', 'TICKER', 'TICKER_BID_ASK', 'TICKER_DEAL_DETAILS', 'TICKER_HANDICAP', 'TICKER_MARKET_INDEX', 'TICKER_STATUS'] as KeysOf<typeof webull.MQTT_TOPICS>,
	}

	private static get options() {
		return _.clone({
			host: 'push.webull.com', port: 9018,
			timeout: '10s' as Clock.Tick,
			connect: true,
			retry: true,
			verbose: false,
		})
	}

	get name() { return 'mqtt://' + this.options.host + ':' + this.options.port }

	constructor(
		public fsymbols: Dict<number>,
		public topics: keyof typeof Watcher.topics,
		public options = {} as Partial<typeof Watcher.options>,
	) {
		super()
		_.defaults(this.options, Watcher.options)
		if (this.options.connect) this.connect();
	}

	tdict: Dict<string>
	client: MqttConnection

	private nextId() { return core.math.random(1, 999) }

	destroy() {
		this.terminate()
		this.offAll()
	}

	terminate() {
		if (this.client) {
			this.client.destroy()
			this.client.removeAllListeners()
			this.client = null
		}
	}

	private reconnect() {
		clock.offListener(this.connect, this)
		clock.once(this.options.timeout, this.connect, this)
	}
	connect() {
		this.terminate()
		this.client = new MqttConnection(net.connect(this.options.port, this.options.host))
		this.client.connect({
			username: process.env.WEBULL_DID,
			password: process.env.WEBULL_TOKEN,
			clientId: 'mqtt_' + Math.random().toString(),
			protocolId: 'MQTT',
			protocolVersion: 4,
			keepalive: 60,
			clean: true,
		})
		this.client.on('data', this._ondata)
		this.client.on('error', this._onerror)
		this.reconnect()
	}

	private _ondata = (packet: Mqtt.Packet) => {

		if (packet.cmd == 'connack') {
			if (this.options.verbose) console.info(this.name, '-> connect');
			clock.offListener(this.connect, this)
			this.emit('connect')

			this.tdict = _.invert(this.fsymbols)
			let topic = {
				tickerIds: Object.values(this.fsymbols),
				header: {
					app: 'stocks',
					did: process.env.WEBULL_DID,
					access_token: process.env.WEBULL_TOKEN,
				},
			}
			let topics = Object.keys(webull.MQTT_TOPICS).filter(v => !isNaN(v as any))
			if (this.topics) {
				topics = Watcher.topics[this.topics].map(v => webull.MQTT_TOPICS[v].toString())
			}

			let subscriptions = topics.map(type => ({
				topic: JSON.stringify(Object.assign(topic, { type })), qos: 0,
			}))
			this.client.subscribe({ subscriptions, messageId: this.nextId() })

			return
		}

		if (packet.cmd == 'suback') {
			if (this.options.verbose) console.info(this.name, '-> subscribed');
			this.emit('subscribed')
			return
		}

		if (packet.cmd == 'disconnect') {
			if (this.options.verbose) console.warn(this.name, '-> disconnect');
			if (this.options.retry) this.reconnect();
			this.emit('disconnect')
			return
		}

		if (packet.cmd == 'publish') {
			let topic = (qs.parse(packet.topic) as any) as Webull.Mqtt.Topic
			let symbol = this.tdict[topic.tid]
			let tid = Number.parseInt(topic.tid)

			let payload = JSON.parse(packet.payload.toString()) as Webull.Mqtt.Payload<Webull.Quote>
			if (!Array.isArray(payload.data) || payload.data.length == 0) return;

			let i: number, len = payload.data.length
			for (i = 0; i < len; i++) {
				let quote = payload.data[i]
				core.fix(quote)
				webull.fixQuote(quote)
				quote.tickerId = tid
				quote.symbol = symbol
				quote.topic = webull.MQTT_TOPICS[topic.type]
				// console.log('data ->', data)
				this.emit('data', quote)
			}

			return
		}

		console.error('packet Error ->', packet)

	}

	private _onerror = (error: Error) => {
		console.error(this.name, 'onerror Error ->', error)
		if (this.options.retry) this.reconnect();
	}

}


