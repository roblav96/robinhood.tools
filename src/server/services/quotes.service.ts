// 

import '../main'
import * as pAll from 'p-all'
import * as schedule from 'node-schedule'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as quotes from '../../common/quotes'
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
const EMITS = {} as Dict<Quotes.Full>
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
	core.object.nullify(EMITS)
	core.object.nullify(SAVES)

	await redis.main.purge(rkeys.QUOTES)

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

	console.log(`resolved ->`, JSON.parse(JSON.stringify(resolved)))

	let coms = [] as Redis.Coms
	let ii = 0
	symbols.forEach(function(symbol, i) {
		let instrument = resolved[ii++] as Robinhood.Instrument
		let yhquote = resolved[ii++] as Yahoo.Quote
		let iexbatch = resolved[ii++] as Iex.Batch
		let wbticker = resolved[ii++] as Webull.Ticker
		let wbquote = resolved[ii++] as Webull.Quote
		let quote = resolved[ii++] as Quotes.Full

		Object.assign(quote, {
			symbol,
			tickerId: wbticker.tickerId,
			typeof: process.env.SYMBOLS,
			alive: instrument.alive,
			mic: instrument.mic,
			acronym: instrument.acronym,
			listDate: new Date(instrument.list_date).valueOf(),
			name: core.fallback(instrument.simple_name, yhquote.shortName, wbticker.tinyName, wbticker.name),
			fullName: core.fallback(instrument.name, yhquote.longName, wbticker.name),
			country: core.fallback(instrument.country, wbticker.regionAlias).toUpperCase(),
			exchange: core.fallback(iexbatch.company.exchange, iexbatch.quote.primaryExchange),
			sharesOutstanding: _.round(core.fallback(wbquote.totalShares, yhquote.sharesOutstanding, iexbatch.stats.sharesOutstanding)),
			sharesFloat: _.round(core.fallback(wbquote.outstandingShares, iexbatch.stats.float)),
			avgVolume: _.round(core.fallback(wbquote.avgVolume, iexbatch.quote.avgTotalVolume)),
			avgVolume10Day: _.round(core.fallback(wbquote.avgVol10D, yhquote.averageDailyVolume10Day)),
			avgVolume3Month: _.round(core.fallback(wbquote.avgVol3M, yhquote.averageDailyVolume3Month)),
		} as Quotes.Full)

		_.defaults(quote, onwbquote(quote, wbquote))

		let reset = {
			status: core.fallback(wbquote.faStatus, wbquote.status),
			eodPrice: quote.price || quote.prevClose,
			dayHigh: quote.price, dayLow: quote.price,
			open: quote.price, high: quote.price, low: quote.price, close: quote.price,
			count: 0, deals: 0,
			bidVolume: 0, askVolume: 0,
			volume: 0, size: 0,
			dealVolume: 0, dealSize: 0,
			buyVolume: 0, buySize: 0,
			sellVolume: 0, sellSize: 0,
		} as Quotes.Full
		_.defaults(quote, reset)
		if (resets) Object.assign(quote, reset);

		applycalcs(quote, quote)

		QUOTES[symbol] = quote
		EMITS[symbol] = {} as any
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

clock.on('1s', function onsocket() {
	Object.keys(EMITS).forEach(symbol => {
		let toquote = EMITS[symbol]
		if (Object.keys(toquote).length == 0) return;
		toquote.symbol = symbol
		socket.emit(`${rkeys.QUOTES}:${symbol}`, toquote)
		EMITS[symbol] = {} as any
	})
	// 
	// let keys = Object.keys(SAVES).filter(k => Object.keys(SAVES[k]).length > 0)
	// if (keys.length == 0) return;
	// let coms = []
	// keys.forEach(k => coms.push(['hmset', `${rkeys.QUOTES}:${k}`, SAVES[k]]))
	// redis.main.coms(coms)
	// keys.forEach(k => SAVES[k] = {} as any)
	// 
	// let coms = Object.keys(SAVES).filter(key => {
	// 	return Object.keys(SAVES[key]).length > 0
	// }).map(v => ['hmset', `${rkeys.QUOTES}:${v}`, SAVES[v]])
	// if (coms.length == 0) return;
	// redis.main.coms(coms as any)
	// Object.keys(SAVES).forEach(symbol => SAVES[symbol] = {} as any)
})

emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	let quote = QUOTES[symbol]
	let toquote = {} as Quotes.Full
	if (!quote) return console.warn('ondata !quote symbol ->', symbol);

	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)
	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
		onwbquote(quote, { deal: wbquote.deal, tradeTime: wbquote.tradeTime } as Webull.Quote, toquote)
		ondeal(quote, {
			symbol,
			side: wbquote.tradeBsFlag,
			price: wbquote.deal,
			size: wbquote.volume,
			timestamp: wbquote.tradeTime,
		}, toquote)
	} else {
		onwbquote(quote, wbquote, toquote)
	}

	if (Object.keys(toquote).length == 0) return;
	applycalcs(quote, toquote)
	// console.info(symbol, '->', webull.mqtt_topics[topic], toquote)
	Object.assign(QUOTES[symbol], toquote)
	Object.assign(EMITS[symbol], toquote)
	Object.assign(SAVES[symbol], toquote)
	// socket.emit(`${rkeys.QUOTES}:${symbol}`, toquote)

})



function ondeal(quote: Quotes.Full, deal: Quotes.Deal, toquote = {} as Quotes.Full) {
	let symbol = quote.symbol

	toquote.deals++
	if (deal.side == 'N') {
		toquote.volume = quote.volume + deal.size
	}


	socket.emit(`${rkeys.DEALS}:${symbol}`, deal)
	return toquote
}



const NOT_EQUALS = (({
	'bid': ('bidPrice' as keyof Quotes.Full) as any,
	'ask': ('askPrice' as keyof Quotes.Full) as any,
	'bidSize': ('bidSize' as keyof Quotes.Full) as any,
	'askSize': ('askSize' as keyof Quotes.Full) as any,
	'deal': ('price' as keyof Quotes.Full) as any,
	'price': ('price' as keyof Quotes.Full) as any,
	'pPrice': ('price' as keyof Quotes.Full) as any,
	'faStatus': ('status' as keyof Quotes.Full) as any,
	'status': ('status' as keyof Quotes.Full) as any,
	'status0': ('status' as keyof Quotes.Full) as any,
	'open': ('openPrice' as keyof Quotes.Full) as any,
	'close': ('closePrice' as keyof Quotes.Full) as any,
	'preClose': ('prevClose' as keyof Quotes.Full) as any,
	'high': ('dayHigh' as keyof Quotes.Full) as any,
	'low': ('dayLow' as keyof Quotes.Full) as any,
	'fiftyTwoWkHigh': ('yearHigh' as keyof Quotes.Full) as any,
	'fiftyTwoWkLow': ('yearLow' as keyof Quotes.Full) as any,
	'totalShares': ('sharesOutstanding' as keyof Quotes.Full) as any,
	'outstandingShares': ('sharesFloat' as keyof Quotes.Full) as any,
	'turnoverRate': ('turnoverRate' as keyof Quotes.Full) as any,
	'vibrateRatio': ('vibrateRatio' as keyof Quotes.Full) as any,
	'yield': ('yield' as keyof Quotes.Full) as any,
	// '____': ('____' as keyof Quotes.Full) as any,
} as Webull.Quote) as any) as Dict<string>

const GREATER_THANS = (({
	'faTradeTime': ('timestamp' as keyof Quotes.Full) as any,
	'tradeTime': ('timestamp' as keyof Quotes.Full) as any,
	'mktradeTime': ('timestamp' as keyof Quotes.Full) as any,
	'volume': ('volume' as keyof Quotes.Full) as any,
	// '____': ('____' as keyof Quotes.Full) as any,
} as Webull.Quote) as any) as Dict<string>

function onwbquote(quote: Quotes.Full, wbquote: Webull.Quote, toquote = {} as Quotes.Full) {
	let symbol = quote.symbol
	// console.log(`quote ->`, JSON.parse(JSON.stringify(quote)))
	Object.keys(wbquote).forEach((k: keyof Quotes.Full) => {
		let source = wbquote[k]
		let key = NOT_EQUALS[k]
		if (key) {
			let target = quote[key]
			if (target != source) {
				toquote[key] = source
			}
			return
		}
		key = GREATER_THANS[k]
		if (key) {
			let target = quote[key]
			if (target == null || source > target) {
				toquote[key] = source
			}
			return
		}
	})
	// console.log(`toquote ->`, JSON.parse(JSON.stringify(toquote)))
	return toquote
}



function applycalcs(quote: Quotes.Full, toquote: Quotes.Full) {
	let symbol = quote.symbol
	if (toquote.price) {
		toquote.close = toquote.price
		toquote.change = toquote.price - quote.eodPrice
		toquote.percent = core.calc.percent(toquote.price, quote.eodPrice)
		toquote.marketCap = core.number.round(toquote.price * quote.sharesOutstanding)
	}
	if (toquote.askPrice || toquote.bidPrice) {
		let bid = toquote.bidPrice || quote.bidPrice
		let ask = toquote.askPrice || quote.askPrice
		toquote.spread = ask - bid
	}
}



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


