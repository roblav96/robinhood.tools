// 

import '../main'
import * as pAll from 'p-all'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as schedule from 'node-schedule'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as hours from '../adapters/hours'
import * as socket from '../adapters/socket'
import * as utils from '../adapters/utils'
import * as webull from '../adapters/webull'
import * as http from '../adapters/http'
import clock from '../../common/clock'



let QUOTES = {} as Dict<Quote>
let SAVES = {} as Dict<Quote>

onSymbols()
pandora.on('onSymbols', onSymbols)
async function onSymbols(hubmsg?: Pandora.HubMessage<Symbols.OnSymbolsData>) {
	if (hubmsg && hubmsg.data.type != 'FOREX') return;
	let fsymbols = await utils.getFullSymbols('FOREX')
	if (_.isEmpty(fsymbols)) return;
	let symbols = Object.keys(fsymbols)

	let wbtickers = await webull.getTickers(fsymbols)
	let wbquotes = await webull.getFullQuotes(fsymbols)

	let quotes = await redis.main.coms(symbols.map(v => ['hgetall', `${rkeys.QUOTES}:${v}`])) as Quote[]
	let coms = [] as Redis.Coms
	quotes.forEach(function(quote, i) {
		core.fix(quote)
		let symbol = symbols[i]
		let wbticker = wbtickers.find(v => v.symbol == symbol)
		let wbquote = wbquotes.find(v => v.symbol == symbol)

		Object.assign(quote, {
			symbol,
			tickerId: fsymbols[symbol],
			typeof: 'FOREX',
			name: wbticker.name,
		} as Quote)
		Object.assign(quote, webull.onQuote({ quote, wbquote }))

		QUOTES[symbol] = quote
		SAVES[symbol] = {} as any

		let rkey = `${rkeys.QUOTES}:${symbol}`
		coms.push(['hmset', rkey, quote as any])
		socket.emit(rkey, quote)

	})

	await redis.main.coms(coms)

	watcher.options.fsymbols = fsymbols
	watcher.connect()

}

const watcher = new webull.MqttClient({
	connect: false,
	topics: 'forex',
})
watcher.on('data', function(topic: number, wbquote: Webull.Quote) {
	// console.log('wbquote ->', topic, wbquote)
})

// const TOPICS = {} as any
// TOPICS[topic] = true
// clock.on('5s', function() {
// 	let topics = Object.keys(TOPICS).map(v => webull.mqtt_topics[v])
// 	console.log('topics ->', topics)
// })

