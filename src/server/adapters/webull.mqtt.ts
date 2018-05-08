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



export class MqttClient extends Emitter<'connect' | 'subscribed' | 'disconnect' | 'data'> {

	private static topics = {
		forex: ['COMMODITY', 'FOREIGN_EXCHANGE', 'TICKER', 'TICKER_BID_ASK', 'TICKER_HANDICAP', 'TICKER_MARKET_INDEX', 'TICKER_STATUS'] as KeysOf<typeof webull.mqtt_topics>,
		stocks: ['COMMODITY', 'FOREIGN_EXCHANGE', 'TICKER', 'TICKER_BID_ASK', 'TICKER_DEAL_DETAILS', 'TICKER_HANDICAP', 'TICKER_MARKET_INDEX', 'TICKER_STATUS'] as KeysOf<typeof webull.mqtt_topics>,
	}

	private static get options() {
		return _.clone({
			fsymbols: null as Dict<number>,
			topics: null as keyof typeof MqttClient.topics,
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
	) {
		super()
		_.defaults(this.options, MqttClient.options)
		if (this.options.connect) this.connect();
	}

	tdict: Dict<string>
	client: MqttConnection

	private nextId() { return core.math.random(1, 999) }

	destroy() {
		this.terminate()
		this.offAll()
		clock.offListener(this.connect, this)
	}

	terminate() {
		if (this.client == null) return;
		this.client.end()
		this.client.destroy()
		this.client.removeAllListeners()
		this.client = null
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
			keepalive: 10,
			clean: true,
		})
		this.client.on('data', this.ondata)
		this.client.on('error', this.onerror)
		this.reconnect()
	}

	private ondata = (packet: Mqtt.Packet) => {

		if (packet.cmd == 'connack') {
			if (this.options.verbose) console.info(this.name, '-> connect');
			clock.offListener(this.connect, this)
			this.emit('connect')

			this.tdict = _.invert(_.mapValues(this.options.fsymbols, v => v.toString()))
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
			let payload = JSON.parse(packet.payload.toString()) as Webull.Mqtt.Payload<Webull.Quote>

			let type = Number.parseInt(topic.type)
			if (type == webull.mqtt_topics.TICKER_BID_ASK) {
				payload.data.remove(v => {
					if (Array.isArray(v.bidList) && v.bidList.length == 0) return true;
					if (Array.isArray(v.askList) && v.askList.length == 0) return true;
					return Object.keys(v).length == 0
				})
			}
			if (payload.data.length == 0) return;

			let tid = Number.parseInt(topic.tid)
			let symbol = this.tdict[topic.tid]

			let i: number, len = payload.data.length
			for (i = 0; i < len; i++) {
				let wbquote = payload.data[i]
				core.fix(wbquote)
				webull.fix(wbquote)
				wbquote.tickerId = tid
				wbquote.symbol = symbol
				// if (this.options.verbose) console.log('data ->', wbquote);
				this.emit('data', type, wbquote)
			}

			return
		}

		console.error('idk packet Error ->', packet)
	}

	private onerror = (error: Error) => {
		// if (this.options.verbose) console.error(this.name, 'onerror Error ->', error);
		console.error(this.name, 'onerror Error ->', error)
		if (this.options.retry) this.reconnect();
	}

}


