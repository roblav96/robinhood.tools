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
import Emitter from '../../common/emitter'
import clock from '../../common/clock'



const emitter = new Emitter<'connect' | 'subscribed' | 'disconnect' | 'data' | 'toquote' | 'fsymbols'>()
export default emitter

declare global { namespace NodeJS { export interface ProcessEnv { SYMBOLS: SymbolsTypes } } }
const CLIENTS = [] as webull.MqttClient[]
const QUOTES = {} as Dict<Webull.Quote>
const SAVES = {} as Dict<Webull.Quote>

pandora.once('symbolsReady', onSymbols)
pandora.broadcast({}, 'readySymbols')

pandora.on('onSymbols', onSymbols)
async function onSymbols(hubmsg: Pandora.HubMessage<Symbols.OnSymbolsData>) {
	if (hubmsg.data.type && hubmsg.data.type != process.env.SYMBOLS) return;
	let resets = hubmsg.data.reset

	let fsymbols = (process.env.SYMBOLS == 'STOCKS' ?
		await utils.getInstanceFullSymbols(process.env.SYMBOLS) :
		await utils.getFullSymbols(process.env.SYMBOLS)
	)
	// if (process.env.DEVELOPMENT) return;
	// if (process.env.DEVELOPMENT) fsymbols = utils[`DEV_${process.env.SYMBOLS}`];
	// socket.setFilter(_.mapValues(fsymbols, v => true))

	emitter.emit('fsymbols', fsymbols, hubmsg.data)
	let symbols = Object.keys(fsymbols)

	let resolved = await redis.main.coms(_.flatten(symbols.map(v => [
		process.env.SYMBOLS == 'STOCKS' ? ['hgetall', `${rkeys.RH.INSTRUMENTS}:${v}`] : ['ping'],
		['hgetall', `${rkeys.WB.TICKERS}:${v}`],
		['hgetall', `${rkeys.WB.QUOTES}:${v}`],
	])))
	resolved.forEach(core.fix)

	CLIENTS.forEach(v => v.destroy())
	core.object.nullify(QUOTES)
	core.object.nullify(SAVES)

	let coms = [] as Redis.Coms
	let ii = 0
	symbols.forEach(function(symbol, i) {
		let instrument = resolved[ii++] as Robinhood.Instrument
		let ticker = resolved[ii++] as Webull.Ticker
		let quote = resolved[ii++] as Webull.Quote

		Object.assign(quote, {
			symbol,
			typeof: process.env.SYMBOLS,
			name: ticker.name,
		} as Webull.Quote)
		if (instrument && instrument.name) {
			quote.name = instrument.simple_name || instrument.name
		}

		QUOTES[symbol] = quote
		SAVES[symbol] = {} as any

		let rkey = `${rkeys.WB.QUOTES}:${symbol}`
		coms.push(['hmset', rkey, quote as any])
		socket.emit(rkey, quote)

	})

	await redis.main.coms(coms)

	let chunks = core.array.chunks(_.toPairs(fsymbols), _.ceil(symbols.length / 256))
	CLIENTS.splice(0, Infinity, ...chunks.map((chunk, i) => new webull.MqttClient(emitter, {
		index: i,
		fsymbols: _.fromPairs(chunk),
		topics: process.env.SYMBOLS,
		connect: chunks.length == 1 && i == 0,
		// verbose: true,
	})))

}

emitter.on('connect', i => console.log('connect ->', i))

clock.on('3s', function onconnect() {
	if (CLIENTS.length == 0) return;
	let client = CLIENTS.find(v => v.options.connect == false)
	if (!client) return;
	client.options.connect = true
	client.connect()
})

clock.on('3s', function onsave() {
	let coms = Object.keys(SAVES).filter(key => {
		return Object.keys(SAVES[key]).length > 0
	}).map(v => ['hmset', `${rkeys.WB.QUOTES}:${v}`, SAVES[v]])
	if (coms.length == 0) return;
	redis.main.coms(coms as any)
	Object.keys(SAVES).forEach(symbol => SAVES[symbol] = {} as any)
})

const GREATER_THANS = {
	faTradeTime: null,
	mkTradeTime: null,
	mktradeTime: null,
	tradeTime: null,
	volume: null,
} as Webull.Quote

emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	let quote = QUOTES[symbol]
	let toquote = {} as Webull.Quote

	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)
	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
		if (wbquote.tradeTime > quote.tradeTime) {
			toquote.tradeTime = wbquote.tradeTime
			if (wbquote.tradeBsFlag == 'N') {
				if (wbquote.deal != toquote.pPrice) toquote.pPrice = wbquote.deal;
			} else {
				if (wbquote.deal != toquote.price) toquote.price = wbquote.deal;
			}
		}
		// delete wbquote.symbol
		// delete wbquote.tickerId
		// socket.emit(`${rkeys.WB.DEALS}:${symbol}`, wbquote)

	} else {
		Object.keys(wbquote).forEach((key: keyof Webull.Quote) => {
			let value = wbquote[key] as any
			if (GREATER_THANS[key] === null) {
				if (value > quote[key]) toquote[key] = value;
				return
			}
			if (quote[key] != value) toquote[key] = value;
		})
	}

	if (Object.keys(toquote).length == 0) return;
	emitter.emit('toquote', topic, toquote)
	// console.info(symbol, '->', webull.mqtt_topics[topic], toquote)
	Object.assign(QUOTES[symbol], toquote)
	Object.assign(SAVES[symbol], toquote)
	socket.emit(`${rkeys.WB.QUOTES}:${symbol}`, toquote)

})

import './calcs.watcher'





// const TOPICS = {} as any
// clock.on('5s', () => console.log('topics ->', Object.keys(TOPICS)))
// TOPICS[webull.mqtt_topics[topic]] = true



// webull.onQuote({ quote, wbquote, toquote })
// if (topic == webull.mqtt_topics.TICKER_STATUS) {
// 	webull.onQuote({ quote, wbquote, toquote, filter: 'status' })

// } else if (topic == webull.mqtt_topics.TICKER_HANDICAP) {
// 	webull.onQuote({ quote, wbquote, toquote, filter: 'ticker' })

// } else if (topic == webull.mqtt_topics.TICKER_BID_ASK) {
// 	webull.onQuote({ quote, wbquote, toquote, filter: 'bidask' })

// } else if (topic == webull.mqtt_topics.FOREIGN_EXCHANGE) {
// 	webull.onQuote({ quote, wbquote, toquote, filter: 'bidask' })
// 	webull.onQuote({ quote, wbquote, toquote, filter: 'ticker' })

// } else if (topic == webull.mqtt_topics.TICKER_MARKET_INDEX) {
// 	webull.onQuote({ quote, wbquote, toquote, filter: 'ticker' })

// } else if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
// 	webull.onQuote({ quote, wbquote, toquote, filter: 'deal' })
// 	socket.emit(`${rkeys.WB.DEALS}:${symbol}`, wbquote)

// }


