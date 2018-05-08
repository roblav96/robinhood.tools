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



declare global { namespace NodeJS { export interface ProcessEnv { SYMBOLS: SymbolsTypes } } }
let QUOTES = {} as Dict<Quote>
let SAVES = {} as Dict<Quote>

// (async function start() {
// 	let readySymbols = await pandora.proxy('readySymbols') as Pandora.readySymbols
// 	await readySymbols(process.env.SYMBOLS)
// })()

onSymbols()
pandora.on('onSymbols', onSymbols)
async function onSymbols(hubmsg?: Pandora.HubMessage<Symbols.OnSymbolsData>) {
	if (hubmsg && hubmsg.data.type != process.env.SYMBOLS) return;
	let reset = _.get(hubmsg, 'data.reset', false)

	let readySymbols = await pandora.proxy('readySymbols') as Pandora.readySymbols
	await readySymbols(process.env.SYMBOLS)

	let fsymbols = (process.env.SYMBOLS == 'STOCKS' ?
		await utils.getInstanceFullSymbols(process.env.SYMBOLS) :
		await utils.getFullSymbols(process.env.SYMBOLS)
	)
	// fsymbols = _.fromPairs(_.toPairs(fsymbols).splice(500))
	// if (process.env.DEVELOPMENT) fsymbols = utils[`DEV_${SYMBOLS}`];
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
			typeof: process.env.SYMBOLS,
			name: wbticker.name
		} as Quote)
		Object.assign(quote, webull.onQuote({ quote, wbquote }))

		QUOTES[symbol] = quote
		SAVES[symbol] = {} as any

		let rkey = `${rkeys.QUOTES}:${symbol}`
		coms.push(['hmset', rkey, quote as any])
		socket.emit(rkey, quote)

	})

	await redis.main.coms(coms)

	console.warn('done')

	// watcher.options.fsymbols = fsymbols
	// watcher.connect()

}

const watcher = new webull.MqttClient({
	topics: process.env.SYMBOLS,
	connect: false
})
watcher.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	// console.log(webull.mqtt_topics[topic], '->', wbquote)
	let symbol = wbquote.symbol
	let quote = QUOTES[symbol]
	let toquote = {} as Quote

	if (topic == webull.mqtt_topics.TICKER_STATUS) {
		webull.onQuote({ quote, wbquote, toquote, filter: 'status' })

	} else if (topic == webull.mqtt_topics.TICKER_HANDICAP) {
		webull.onQuote({ quote, wbquote, toquote, filter: 'ticker' })

	} else if (topic == webull.mqtt_topics.TICKER_BID_ASK) {
		webull.onQuote({ quote, wbquote, toquote, filter: 'bidask' })

	} else if (topic == webull.mqtt_topics.FOREIGN_EXCHANGE) {
		webull.onQuote({ quote, wbquote, toquote, filter: 'bidask' })
		webull.onQuote({ quote, wbquote, toquote, filter: 'ticker' })

	} else if (topic == webull.mqtt_topics.TICKER_MARKET_INDEX) {
		webull.onQuote({ quote, wbquote, toquote, filter: 'ticker' })

	}

	if (Object.keys(toquote).length == 0) return;
	// console.log('toquote ->', webull.mqtt_topics[topic], JSON.parse(JSON.stringify(toquote)))
	Object.assign(QUOTES[symbol], toquote)
	Object.assign(SAVES[symbol], toquote)
	socket.emit(`${rkeys.QUOTES}:${symbol}`, toquote)

})

clock.on('5s', function onsave() {
	let coms = Object.keys(SAVES).filter(v => {
		return Object.keys(SAVES[v]).length > 0
	}).map(v => ['hmset', `${rkeys.QUOTES}:${v}`, SAVES[v]])
	if (coms.length == 0) return;
	redis.main.coms(coms as any)
	Object.keys(SAVES).forEach(symbol => SAVES[symbol] = {} as any)
})

// const TOPICS = {} as any
// TOPICS[topic] = true
// clock.on('5s', function() {
// 	let topics = Object.keys(TOPICS).map(v => webull.mqtt_topics[v])
// 	console.log('topics ->', topics)
// })

