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
import radio from './radio'



let mqtts = 0
radio.on('webull.mqtts', function onmqtt(event: Radio.Event<number>) {
	mqtts += event.data
})

type Topics = (keyof typeof webull.mqtt_topics)[]
export default class WebullMqttClient {

	private static topics = {
		STOCKS: ['TICKER', 'TICKER_DEAL_DETAILS', 'TICKER_BID_ASK', 'TICKER_HANDICAP', 'TICKER_STATUS'] as Topics,
		FOREX: ['FOREIGN_EXCHANGE', 'TICKER_BID_ASK', 'TICKER_HANDICAP', 'TICKER_STATUS'] as Topics,
		INDEXES: ['TICKER_MARKET_INDEX', 'FOREIGN_EXCHANGE', 'TICKER_BID_ASK', 'TICKER_HANDICAP', 'TICKER_STATUS'] as Topics,
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
		_.delay(() => this.reconnect(), 100)
		radio.emit('webull.mqtts', 1)
	}

	alive = false
	dsymbols: Dict<string>
	client: MqttConnection

	private nextId() { return _.random(111, 999) }

	destroy() {
		this.terminate()
		clock.offListener(this.reconnect, this)
		radio.emit('webull.mqtts', -1)
	}

	terminate() {
		this.alive = false
		if (this.client) {
			this.client.destroy()
			this.client.removeAllListeners()
			this.client = null
		}
	}

	private timeout: number
	private ontimeout = () => this.connect()
	private reconnect() {
		if (this.alive) {
			this.alive = false
			this.client.pingreq()
			return
		}
		clearTimeout(this.timeout)
		this.timeout = _.delay(this.ontimeout, 100 + _.random(0, mqtts * 100))
	}

	private connect() {
		if (this.alive) return;
		this.terminate()
		this.client = new MqttConnection(net.createConnection(this.options.port, this.options.host))
		this.client.connect({
			username: process.env.WEBULL_DID,
			password: process.env.WEBULL_TOKEN,
			clientId: 'mqtt_' + this.nextId(),
			protocolId: 'MQTT',
			protocolVersion: 4,
			keepalive: 30,
			clean: true,
		})
		this.client.on('data', this.ondata)
		this.client.on('close', this.onclose)
		this.client.on('error', this.onerror)
		if (!clock.hasListener(this.reconnect, this)) {
			clock.on(this.options.heartbeat, this.reconnect, this)
		} else console.log('connect reconnecting');
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

	private onclose = reason => {
		console.warn('onclose ->', reason)
		this.alive = false
	}

	private onerror = (error: Error) => {
		console.error('onerror Error ->', error)
		this.alive = false
	}

}


