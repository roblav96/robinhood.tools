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

onSymbols()
pandora.on('onSymbols', onSymbols)
async function onSymbols(hubmsg?: Pandora.HubMessage<Symbols.OnSymbolsData>) {
	if (hubmsg && hubmsg.data.type != process.env.SYMBOLS) return;
	let resets = _.get(hubmsg, 'data.reset', false) as boolean

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

	let resolved = await redis.main.coms(_.flatten(symbols.map(v => [
		['hgetall', `${rkeys.RH.INSTRUMENTS}:${v}`],
		['hgetall', `${rkeys.QUOTES}:${v}`],
	])))
	resolved.forEach(core.fix)

	let coms = [] as Redis.Coms
	let ii = 0
	symbols.forEach(function(symbol, i) {
		let instrument = resolved[ii++] as Robinhood.Instrument
		let wbticker = wbtickers.find(v => v.symbol == symbol)
		let wbquote = wbquotes.find(v => v.symbol == symbol)
		let quote = resolved[ii++] as Quote

		Object.assign(quote, {
			symbol,
			tickerId: fsymbols[symbol],
			typeof: process.env.SYMBOLS,
			name: wbticker.name
		} as Quote)
		Object.assign(quote, webull.onQuote({ quote, wbquote }))

		if (process.env.SYMBOLS == 'STOCKS') {
			Object.assign(quote, {
				name: instrument.name,
				tradable: instrument.alive,
				listDate: new Date(instrument.list_date).valueOf(),
				mic: instrument.mic,
				acronym: instrument.acronym,
				country: instrument.country,
			} as Quote)
			let reset = {
				volume: 0, dealCount: 0,
				buyVolume: 0, sellVolume: 0,
			} as Quote
			_.defaults(quote, reset)
			if (resets) Object.assign(quote, reset);
		}
		
		console.log('quote ->', JSON.parse(JSON.stringify(quote)))

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
	topics: process.env.SYMBOLS,
	connect: false,
	verbose: true,
})
watcher.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	// console.log(webull.mqtt_topics[topic], '->', wbquote)
	let symbol = wbquote.symbol
	let quote = QUOTES[symbol]
	let toquote = {} as Quote

	// webull.onQuote({ quote, wbquote, toquote })

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

	} else if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
		webull.onQuote({ quote, wbquote, toquote, filter: 'deal' })
		socket.emit(`${rkeys.DEALS}:${symbol}`, {
			symbol,
			price: wbquote.deal,
			size: wbquote.volume,
			side: wbquote.tradeBsFlag,
			time: wbquote.tradeTime,
		} as Quote.Deal)

	}

	if (Object.keys(toquote).length == 0) return;
	console.log('toquote ->', webull.mqtt_topics[topic], JSON.parse(JSON.stringify(toquote)))
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

