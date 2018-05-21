// 

import '../main'
import * as pAll from 'p-all'
import * as schedule from 'node-schedule'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as hours from '../adapters/hours'
import * as socket from '../adapters/socket'
import * as utils from '../adapters/utils'
import * as webull from '../adapters/webull'
import * as http from '../adapters/http'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'



export const emitter = new Emitter<'connect' | 'subscribed' | 'disconnect' | 'data'>()
const CLIENTS = [] as webull.MqttClient[]
const QUOTES = {} as Dict<Quotes.Full>
const SAVES = {} as Dict<Quotes.Full>

pandora.once('symbols.ready', onSymbols)
pandora.broadcast({}, 'symbols.start')
if (process.env.SYMBOLS == 'STOCKS') {
	pandora.on('symbols.reset', onSymbols)
}

async function onSymbols(hubmsg: Pandora.HubMessage) {
	let resets = hubmsg.action == 'symbols.reset'

	let fsymbols = (process.env.SYMBOLS == 'STOCKS' ?
		await utils.getInstanceFullSymbols(process.env.SYMBOLS) :
		await utils.getFullSymbols(process.env.SYMBOLS)
	)
	// if (process.env.DEVELOPMENT) return;
	if (process.env.DEVELOPMENT && +process.env.SCALE == 1) {
		fsymbols = utils[`DEV_${process.env.SYMBOLS}`]
	}

	CLIENTS.forEach(v => v.destroy())
	core.object.nullify(QUOTES)
	core.object.nullify(SAVES)

	let symbols = Object.keys(fsymbols)
	let resolved = await redis.main.coms(_.flatten(symbols.map(v => [
		['hgetall', `${rkeys.RH.INSTRUMENTS}:${v}`],
		['hgetall', `${rkeys.YH.QUOTES}:${v}`],
		['hgetall', `${rkeys.IEX.BATCH}:${v}`],
		['hgetall', `${rkeys.WB.TICKERS}:${v}`],
		['hgetall', `${rkeys.WB.QUOTES}:${v}`],
		['hgetall', `${rkeys.QUOTES}:${v}`],
	])))
	resolved.forEach(core.fix)

	let coms = [] as Redis.Coms
	let ii = 0
	symbols.forEach(function(symbol, i) {
		let instrument = resolved[ii++] as Robinhood.Instrument
		let yhquotes = resolved[ii++] as Yahoo.Quote
		let iexbatch = _.mapValues(resolved[ii++], v => JSON.parse(v)) as Iex.Batch
		let wbticker = resolved[ii++] as Webull.Ticker
		let wbquote = resolved[ii++] as Webull.Quote
		let quote = resolved[ii++] as Quotes.Full

		Object.assign(quote, {
			symbol,
			tickerId: wbticker.tickerId,
			typeof: process.env.SYMBOLS,
			name: _.compact([instrument.simple_name, yhquotes.shortName, wbticker.tinyName, wbticker.name])[0],
			fullName: _.compact([instrument.name, yhquotes.longName, wbticker.name])[0],
		} as Quotes.Full)

		let reset = {
			deals: 0,
			volume: 0,
		} as Quotes.Full

		_.defaults(quote, reset)
		if (resets) Object.assign(quote, reset);

		QUOTES[symbol] = quote
		SAVES[symbol] = {} as any

		let rkey = `${rkeys.QUOTES}:${symbol}`
		coms.push(['hmset', rkey, quote as any])
		socket.emit(rkey, quote)

	})

	await redis.main.coms(coms)

	let chunks = core.array.chunks(_.toPairs(fsymbols), _.ceil(symbols.length / 128))
	CLIENTS.splice(0, Infinity, ...chunks.map((chunk, i) => new webull.MqttClient({
		fsymbols: _.fromPairs(chunk),
		topics: process.env.SYMBOLS,
		index: i, chunks: chunks.length,
		connect: chunks.length == 1 && i == 0,
		// verbose: true,
	}, emitter)))

}

// emitter.on('connect', i => console.log('connect ->', i))

clock.on('5s', function onconnect() {
	if (CLIENTS.length == 0) return;
	let client = CLIENTS.find(v => v.started == false)
	if (!client) return;
	client.connect()
})

clock.on('3s', function onsave() {
	let keys = Object.keys(SAVES).filter(k => Object.keys(SAVES[k]).length > 0)
	if (keys.length == 0) return;
	let coms = []
	keys.forEach(k => coms.push(['hmset', `${rkeys.QUOTES}:${k}`, SAVES[k]]))
	redis.main.coms(coms)
	keys.forEach(k => SAVES[k] = {} as any)
	// let coms = Object.keys(SAVES).filter(key => {
	// 	return Object.keys(SAVES[key]).length > 0
	// }).map(v => ['hmset', `${rkeys.QUOTES}:${v}`, SAVES[v]])
	// if (coms.length == 0) return;
	// redis.main.coms(coms as any)
	// Object.keys(SAVES).forEach(symbol => SAVES[symbol] = {} as any)
})

const GREATER_KEYS = {
	dealNum: 1,
	faTradeTime: 1,
	mktradeTime: 1,
	tradeTime: 1,
	volume: 1,
} as Webull.Quote

emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	let quote = QUOTES[symbol]
	let toquote = {} as Quotes.Full
	if (!quote) return console.warn('ondata !quote symbol ->', symbol);

	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)
	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
		// emitter.emit('deal', wbquote)
		socket.emit(`${rkeys.DEALS}:${symbol}`, {
			symbol,
			side: wbquote.tradeBsFlag,
			price: wbquote.deal,
			size: wbquote.volume,
			timestamp: wbquote.tradeTime,
		} as Quotes.Deal)

		// if (wbquote.tradeTime > quote.tradeTime) toquote.tradeTime = wbquote.tradeTime;
		// if (wbquote.tradeBsFlag == 'N') {
		// 	if (wbquote.tradeTime > quote.faTradeTime) toquote.faTradeTime = wbquote.tradeTime;
		// 	if (wbquote.deal != toquote.pPrice) toquote.pPrice = wbquote.deal;
		// 	toquote.volume = quote.volume + wbquote.volume
		// } else {
		// 	if (wbquote.tradeTime > quote.mktradeTime) toquote.mktradeTime = wbquote.tradeTime;
		// 	if (wbquote.deal != toquote.price) toquote.price = wbquote.deal;
		// }
		// toquote.dealNum = quote.dealNum + 1

	} else {
		Object.keys(wbquote).forEach((key: keyof Webull.Quote) => {
			let from = quote[key] as number
			let to = wbquote[key] as number
			if (GREATER_KEYS[key]) {
				if (to > from) toquote[key] = to;
			} else if (to != from) {
				toquote[key] = to
			}
		})

	}

	if (Object.keys(toquote).length == 0) return;
	// console.info(symbol, '->', webull.mqtt_topics[topic], toquote)
	toquote.symbol = symbol
	Object.assign(QUOTES[symbol], toquote)
	Object.assign(SAVES[symbol], toquote)
	socket.emit(`${rkeys.QUOTES}:${symbol}`, toquote)

})



if (process.env.SYMBOLS == 'STOCKS') require('./calcs.service');
declare global { namespace NodeJS { export interface ProcessEnv { SYMBOLS: SymbolsTypes } } }





// } else if (key == 'volume') {
// 	let volume = quote.volume
// 	console.log('symbol ->', symbol)
// 	console.log('volume ->', volume)
// 	console.log('value ->', value)
// 	if (value > volume || Math.abs(core.calc.percent(value, volume)) > 5) {
// 		toquote.volume = value
// 	}
// 	// if (value > quote.volume && hours.rxstate.value == 'REGULAR') {
// 	// if (value > quote.volume) {
// 	// 	toquote.volume = value
// 	// }
// 	// let volume = quote.volume
// 	// if (value == volume) return;
// 	// if (value > volume || Math.abs(core.calc.percent(value, volume)) > 5) {
// 	// 	toquote.volume = value
// 	// }
// 	// let percent = core.calc.percent(value, volume)
// 	// if (percent > 95) return;
// 	// if (value > volume || percent < -95) return toquote.volume = value;


