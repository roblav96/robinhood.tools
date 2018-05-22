// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as socket from '../adapters/socket'
import * as utils from '../adapters/utils'
import * as webull from '../adapters/webull'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'



declare global {
	namespace NodeJS { export interface ProcessEnv { SYMBOLS: SymbolsTypes } }
	namespace Webull {
		interface Watcher<T> {
			rkey: string
			onSymbols: typeof onSymbols
			emitter: typeof emitter
			QUOTES: Dict<T>
			SAVES: Dict<T>
		}
	}
}
export let rkey = ''
export let onSymbols = _.noop as (hubmsg: Pandora.HubMessage, fsymbols: Dict<number>) => Promise<void>
export const emitter = new Emitter<'connect' | 'subscribed' | 'disconnect' | 'data'>()
export const QUOTES = {} as Dict
export const SAVES = {} as Dict

const EMITS = {} as Dict
const CLIENTS = [] as webull.MqttClient[]
console.log(`CLIENTS ->`, CLIENTS)

pandora.once('symbols.ready', onsymbols)
pandora.broadcast({}, 'symbols.start')
if (process.env.SYMBOLS == 'STOCKS') {
	pandora.on('symbols.reset', onsymbols)
}

async function onsymbols(hubmsg: Pandora.HubMessage) {
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

	await onSymbols(hubmsg, fsymbols)

	let symbols = Object.keys(fsymbols)
	await redis.main.coms(symbols.map(function(symbol, i) {
		EMITS[symbol] = {} as any
		SAVES[symbol] = {} as any
		let quote = QUOTES[symbol]
		socket.emit(`${rkey}:${symbol}`, quote)
		return ['hmset', `${rkey}:${symbol}`, quote as any]
	}))

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
		socket.emit(`${rkey}:${symbol}`, toquote)
		EMITS[symbol] = {} as any
	})
})





// emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
// 	let symbol = wbquote.symbol
// 	if (!QUOTES[symbol]) return console.warn('ondata !quote symbol ->', symbol);

// 	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)
// 	let toquote = onData(topic, wbquote)

// 	if (Object.keys(toquote).length == 0) return;
// 	// console.info(symbol, '->', webull.mqtt_topics[topic], toquote)
// 	Object.assign(QUOTES[symbol], toquote)
// 	Object.assign(EMITS[symbol], toquote)
// 	Object.assign(SAVES[symbol], toquote)

// })



// function ondeal(quote: Quotes.Full, deal: Quotes.Deal, toquote = {} as Quotes.Full) {
// 	let symbol = quote.symbol

// 	toquote.deals++
// 	if (deal.side == 'N') {
// 		toquote.volume = quote.volume + deal.size
// 	}


// 	socket.emit(`${rkeys.DEALS}:${symbol}`, deal)
// 	return toquote
// }



// const NOT_EQUALS = (({
// 	'bid': ('bidPrice' as keyof Quotes.Full) as any,
// 	'ask': ('askPrice' as keyof Quotes.Full) as any,
// 	'bidSize': ('bidSize' as keyof Quotes.Full) as any,
// 	'askSize': ('askSize' as keyof Quotes.Full) as any,
// 	'deal': ('price' as keyof Quotes.Full) as any,
// 	'price': ('price' as keyof Quotes.Full) as any,
// 	'pPrice': ('price' as keyof Quotes.Full) as any,
// 	'faStatus': ('status' as keyof Quotes.Full) as any,
// 	'status': ('status' as keyof Quotes.Full) as any,
// 	'status0': ('status' as keyof Quotes.Full) as any,
// 	'open': ('openPrice' as keyof Quotes.Full) as any,
// 	'close': ('closePrice' as keyof Quotes.Full) as any,
// 	'preClose': ('prevClose' as keyof Quotes.Full) as any,
// 	'high': ('dayHigh' as keyof Quotes.Full) as any,
// 	'low': ('dayLow' as keyof Quotes.Full) as any,
// 	'fiftyTwoWkHigh': ('yearHigh' as keyof Quotes.Full) as any,
// 	'fiftyTwoWkLow': ('yearLow' as keyof Quotes.Full) as any,
// 	'totalShares': ('sharesOutstanding' as keyof Quotes.Full) as any,
// 	'outstandingShares': ('sharesFloat' as keyof Quotes.Full) as any,
// 	'turnoverRate': ('turnoverRate' as keyof Quotes.Full) as any,
// 	'vibrateRatio': ('vibrateRatio' as keyof Quotes.Full) as any,
// 	'yield': ('yield' as keyof Quotes.Full) as any,
// 	// '____': ('____' as keyof Quotes.Full) as any,
// } as Webull.Quote) as any) as Dict<string>

// const GREATER_THANS = (({
// 	'faTradeTime': ('timestamp' as keyof Quotes.Full) as any,
// 	'tradeTime': ('timestamp' as keyof Quotes.Full) as any,
// 	'mktradeTime': ('timestamp' as keyof Quotes.Full) as any,
// 	'dealNum': ('dealNum' as keyof Quotes.Full) as any,
// 	'volume': ('volume' as keyof Quotes.Full) as any,
// 	// '____': ('____' as keyof Quotes.Full) as any,
// } as Webull.Quote) as any) as Dict<string>

// // const OUT_RANGE = (({
// // 	// '____': ('____' as keyof Quotes.Full) as any,
// // 	// '____': ('____' as keyof Quotes.Full) as any,
// // 	// '____': ('____' as keyof Quotes.Full) as any,
// // } as Webull.Quote) as any) as Dict<string>

// function onwbquote(quote: Quotes.Full, wbquote: Webull.Quote, toquote = {} as Quotes.Full) {
// 	let symbol = quote.symbol
// 	// console.log(`quote ->`, JSON.parse(JSON.stringify(quote)))
// 	Object.keys(wbquote).forEach((k: keyof Quotes.Full) => {
// 		let source = wbquote[k]
// 		let key = NOT_EQUALS[k]
// 		if (key) {
// 			let target = quote[key]
// 			if (target != source) {
// 				toquote[key] = source
// 			}
// 			return
// 		}
// 		key = GREATER_THANS[k]
// 		if (key) {
// 			let target = quote[key]
// 			if (target == null || source > target) {
// 				toquote[key] = source
// 			}
// 			return
// 		}
// 	})
// 	// console.log(`toquote ->`, JSON.parse(JSON.stringify(toquote)))
// 	return toquote
// }



// function applycalcs(quote: Quotes.Full, toquote: Quotes.Full) {
// 	let symbol = quote.symbol
// 	if (toquote.price) {
// 		toquote.close = toquote.price
// 		toquote.change = toquote.price - quote.eodPrice
// 		toquote.percent = core.calc.percent(toquote.price, quote.eodPrice)
// 		toquote.marketCap = core.number.round(toquote.price * quote.sharesOutstanding)
// 	}
// 	if (toquote.askPrice || toquote.bidPrice) {
// 		let bid = toquote.bidPrice || quote.bidPrice
// 		let ask = toquote.askPrice || quote.askPrice
// 		toquote.spread = ask - bid
// 	}
// }








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


