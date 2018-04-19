// 
export * from '../../common/webull'
// 

import * as net from 'net'
import * as Mqtt from 'mqtt'
import * as MqttConnection from 'mqtt-connection'
import * as qs from 'querystring'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as webull from '../../common/webull'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'



export class WebullMqtt extends Emitter<'connect' | 'subscribed' | 'disconnect' | 'message'> {

	private static get options() {
		return _.clone({
			// topics: [
			// 	'TICKER',
			// ] as KeysOf<typeof webull.MQTT_TOPICS>,
			host: 'push.webull.com', port: 9018,
			timeout: '5s' as Clock.Tick,
			connect: true,
			retry: true,
			verbose: false,
		})
	}

	get name() { return 'mqtt://' + this.options.host + ':' + this.options.port }

	constructor(
		public tickerIds: number[],
		public options = {} as Partial<typeof WebullMqtt.options>,
	) {
		super()
		_.defaults(this.options, WebullMqtt.options)
		if (this.options.connect) this.connect();
	}

	client: MqttConnection

	private _nextId() { return core.math.random(1, 999) }

	destroy() {
		this.terminate()
		this.offAll()
	}

	terminate() {
		if (this.client) {
			// this.client.unsubscribe({
			// 	messageId: this._nextId(),
			// 	unsubscriptions: ['ALL'],
			// }, () => {
			// 	this.client.disconnect({}, () => {
			this.client.end()
			this.client.destroy()
			this.client.removeAllListeners()
			this.client = null
			// 	})
			// })
		}
	}

	private _reconnect() {
		clock.offListener(this._connect)
		clock.once(this.options.timeout, this._connect)
	}

	private _connect = () => this.connect()
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
		this._reconnect()
	}

	private _ondata = (packet: Mqtt.Packet) => {

		if (packet.cmd == 'connack') {
			if (this.options.verbose) console.info(this.name, '-> connect');
			clock.offListener(this._connect)
			this.emit('connect')

			let topic = {
				tickerIds: this.tickerIds,
				header: {
					app: 'stocks',
					did: process.env.WEBULL_DID,
					access_token: process.env.WEBULL_TOKEN,
				},
			}
			let topics = Object.keys(webull.MQTT_TOPICS).filter(v => !isNaN(v as any))
			let subscriptions = topics.map(type => ({
				topic: JSON.stringify(Object.assign(topic, { type })), qos: 0,
			}))
			this.client.subscribe({ subscriptions, messageId: this._nextId() })

			return
		}

		if (packet.cmd == 'suback') {
			this.emit('subscribed')
			return
		}

		if (packet.cmd == 'disconnect') {
			if (this.options.verbose) console.warn(this.name, '-> disconnect');
			if (this.options.retry) this._reconnect();
			this.emit('disconnect')
			return
		}

		if (packet.cmd == 'publish') {
			let topic = (qs.parse(packet.topic) as any) as Webull.Mqtt.Topic
			let tid = Number.parseInt(topic.tid)
			let payload = JSON.parse(packet.payload.toString()) as Webull.Mqtt.Payload
			// if (!Array.isArray(payload.data) || payload.data.length == 0) return;

			payload.data.forEach(function(data) {
				data.topic = webull.MQTT_TOPICS[topic.type]
				data.tickerId = tid
				console.log('data ->', data)
			})

			return
		}

		console.log('packet ->', packet)

	}

	private _onerror = (error: Error) => {
		console.error(this.name, 'onerror Error ->', error)
	}

}








export async function search(query: string) {
	// return got.get('https://infoapi.webull.com/api/search/tickers2', {
	// 	query: { keys: query },
	// 	json: true,
	// }).then(function({ body }) {
	// 	return body
	// })
}


