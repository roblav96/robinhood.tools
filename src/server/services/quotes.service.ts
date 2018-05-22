// 

import '../main'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as utils from '../adapters/utils'
import * as redis from '../adapters/redis'
import * as socket from '../adapters/socket'
import * as webull from '../adapters/webull'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'



const emitter = new Emitter<'connect' | 'subscribed' | 'disconnect' | 'data'>()
const QUOTES = {} as Dict<Quotes.Full>
const SAVES = {} as Dict<Quotes.Full>
const EMITS = {} as Dict<Quotes.Full>
const CLIENTS = [] as webull.MqttClient[]

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
	let symbols = Object.keys(fsymbols)

	CLIENTS.forEach(v => v.destroy())
	core.object.nullify(QUOTES)
	core.object.nullify(EMITS)
	core.object.nullify(SAVES)

	let resolved = await redis.main.coms(_.flatten(symbols.map(v => [
		['hgetall', `${rkeys.QUOTES}:${v}`],
		['hgetall', `${rkeys.WB.TICKERS}:${v}`],
		['hgetall', `${rkeys.WB.QUOTES}:${v}`],
		['hgetall', `${rkeys.RH.INSTRUMENTS}:${v}`],
		['hgetall', `${rkeys.YH.QUOTES}:${v}`],
		['hgetall', `${rkeys.IEX.BATCH}:${v}`],
	])))
	resolved.forEach(core.fix)

	let ii = 0
	let coms = [] as Redis.Coms
	symbols.forEach(function(symbol, i) {
		console.log(`symbol ->`, symbol)
		let quote = resolved[ii++] as Quotes.Full
		let wbticker = resolved[ii++] as Webull.Ticker
		let wbquote = resolved[ii++] as Webull.Quote
		let instrument = resolved[ii++] as Robinhood.Instrument
		let yhquote = resolved[ii++] as Yahoo.Quote
		let iexbatch = resolved[ii++] as Iex.Batch

		core.object.merge(quote, {
			symbol,
			tickerId: wbticker.tickerId,
			typeof: process.env.SYMBOLS,
			name: core.fallback(instrument.simple_name, yhquote.shortName, wbticker.tinyName, wbticker.name),
			fullName: core.fallback(instrument.name, yhquote.longName, wbticker.name),
			country: core.fallback(instrument.country, wbquote.countryISOCode, wbquote.regionAlias),
			currency: wbquote.currency,
		})

		core.object.merge(quote, {
			alive: instrument.alive,
			mic: instrument.mic,
			acronym: instrument.acronym,
			listDate: new Date(instrument.list_date).valueOf(),
			exchange: core.fallback(_.get(iexbatch, 'company.exchange'), _.get(iexbatch, 'quote.primaryExchange')),
			sharesOutstanding: _.round(core.fallback(wbquote.totalShares, yhquote.sharesOutstanding, _.get(iexbatch, 'stats.sharesOutstanding'))),
			sharesFloat: _.round(core.fallback(wbquote.outstandingShares, _.get(iexbatch, 'stats.float'))),
			avgVolume: _.round(core.fallback(wbquote.avgVolume, _.get(iexbatch, 'quote.avgTotalVolume'))),
			avgVolume10Day: _.round(core.fallback(wbquote.avgVol10D, yhquote.averageDailyVolume10Day)),
			avgVolume3Month: _.round(core.fallback(wbquote.avgVol3M, yhquote.averageDailyVolume3Month)),
		} as Quotes.Full)

		let toquote = applywbquote(quote, wbquote)
		core.object.repair(quote, toquote)

		let reset = {
			eodPrice: quote.price,
			dayHigh: quote.price, dayLow: quote.price,
			open: quote.price, high: quote.price, low: quote.price, close: quote.price,
			count: 0, deals: 0, dealNum: 0,
			bidVolume: 0, askVolume: 0,
			volume: 0, size: 0,
			dealVolume: 0, dealSize: 0,
			buyVolume: 0, buySize: 0,
			sellVolume: 0, sellSize: 0,
		} as Quotes.Full
		core.object.repair(quote, reset)
		if (resets) core.object.merge(quote, reset);

		applycalcs(quote, quote)

		console.log(symbol, 'quote ->', quote)

		Object.assign(QUOTES, { [symbol]: quote })
		Object.assign(SAVES, { [symbol]: {} })
		Object.assign(EMITS, { [symbol]: {} })

		let rkey = `${rkeys.QUOTES}:${symbol}`
		socket.emit(rkey, quote)
		// coms.push(['hmset', rkey, quote as any])

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

clock.on('5s', function onsave() {
	let coms = []
	Object.keys(SAVES).forEach(symbol => {
		let quote = SAVES[symbol]
		if (Object.keys(quote).length == 0) return;
		coms.push(['hmset', `${rkeys.QUOTES}:${symbol}`, quote as any])
		Object.assign(SAVES, { [symbol]: {} })
	})
	if (coms.length > 0) redis.main.coms(coms);
})

clock.on('1s', function onsocket() {
	Object.keys(EMITS).forEach(symbol => {
		let quote = EMITS[symbol]
		if (Object.keys(quote).length == 0) return;
		quote.symbol = symbol
		socket.emit(`${rkeys.QUOTES}:${symbol}`, quote)
		Object.assign(EMITS, { [symbol]: {} })
	})
})



emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	let quote = QUOTES[symbol]
	let toquote = {} as Quotes.Full
	if (!quote) return console.warn('ondata !quote symbol ->', symbol);
	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)

	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
		applywbdeal(quote, wbquote, toquote)
	} else {
		applywbquote(quote, wbquote, toquote)
	}

	let tokeys = Object.keys(toquote)
	if (tokeys.length == 0) return;

	applycalcs(quote, toquote)

	Object.assign(QUOTES[symbol], toquote)
	Object.assign(EMITS[symbol], toquote)
	Object.assign(SAVES[symbol], toquote)

	// console.info(symbol, '->', webull.mqtt_topics[topic], toquote)

})



function applycalcs(quote: Quotes.Full, toquote: Quotes.Full) {
	let symbol = quote.symbol

	if (toquote.price) {
		toquote.close = toquote.price
		if (quote.eodPrice) {
			toquote.change = toquote.price - quote.eodPrice
			toquote.percent = core.calc.percent(toquote.price, quote.eodPrice)
		}
		if (quote.sharesOutstanding) {
			toquote.marketCap = _.round(toquote.price * quote.sharesOutstanding)
		}
	}

	if (toquote.askPrice || toquote.bidPrice) {
		let bid = toquote.bidPrice || quote.bidPrice
		let ask = toquote.askPrice || quote.askPrice
		toquote.spread = ask - bid
	}

	return toquote
}



function applywbdeal(quote: Quotes.Full, wbdeal: Webull.Deal, toquote = {} as Quotes.Full) {
	let symbol = quote.symbol

	let deal = webull.toDeal(wbdeal)
	socket.emit(`${rkeys.DEALS}:${symbol}`, deal)

	if (deal.timestamp > quote.timestamp) {
		toquote.timestamp = deal.timestamp
		if (deal.price != quote.price) {
			toquote.price = deal.price
		}
	}

	toquote.deals = quote.deals + 1
	toquote.dealSize = quote.dealSize + deal.size
	toquote.dealVolume = quote.dealVolume + deal.size

	if (deal.side == 'B') {
		toquote.buySize = quote.buySize + deal.size
		toquote.buyVolume = quote.buyVolume + deal.size
	}
	else if (deal.side == 'S') {
		toquote.sellSize = quote.sellSize + deal.size
		toquote.sellVolume = quote.sellVolume + deal.size
	}
	else {
		toquote.volume = quote.volume + deal.size
	}

	return toquote
}



interface KeyMapValue {
	key: keyof Quotes.Full
	greater: boolean, resets: boolean, time: boolean
}
const KEY_MAP = (({
	'faStatus': ({ key: 'status' } as KeyMapValue) as any,
	'status': ({ key: 'status' } as KeyMapValue) as any,
	'status0': ({ key: 'status' } as KeyMapValue) as any,
	// 
	'open': ({ key: 'openPrice' } as KeyMapValue) as any,
	'close': ({ key: 'closePrice' } as KeyMapValue) as any,
	'preClose': ({ key: 'prevClose' } as KeyMapValue) as any,
	// 
	'high': ({ key: 'dayHigh' } as KeyMapValue) as any,
	'low': ({ key: 'dayLow' } as KeyMapValue) as any,
	'fiftyTwoWkHigh': ({ key: 'yearHigh' } as KeyMapValue) as any,
	'fiftyTwoWkLow': ({ key: 'yearLow' } as KeyMapValue) as any,
	// 
	'bid': ({ key: 'bidPrice' } as KeyMapValue) as any,
	'ask': ({ key: 'askPrice' } as KeyMapValue) as any,
	'bidSize': ({ key: 'bidSize' } as KeyMapValue) as any,
	'askSize': ({ key: 'askSize' } as KeyMapValue) as any,
	// 
	'totalShares': ({ key: 'sharesOutstanding' } as KeyMapValue) as any,
	'outstandingShares': ({ key: 'sharesFloat' } as KeyMapValue) as any,
	'turnoverRate': ({ key: 'turnoverRate' } as KeyMapValue) as any,
	'vibrateRatio': ({ key: 'vibrateRatio' } as KeyMapValue) as any,
	'yield': ({ key: 'yield' } as KeyMapValue) as any,
	// 
	'faTradeTime': ({ key: 'timestamp', time: true } as KeyMapValue) as any,
	'tradeTime': ({ key: 'timestamp', time: true } as KeyMapValue) as any,
	'mktradeTime': ({ key: 'timestamp', time: true } as KeyMapValue) as any,
	// 
	'dealNum': ({ key: 'dealNum', greater: true, resets: true } as KeyMapValue) as any,
	'volume': ({ key: 'volume', greater: true, resets: true } as KeyMapValue) as any,
	// '____': ({ key: '____' } as KeyMapValue) as any,
} as Webull.Quote) as any) as Dict<KeyMapValue>



function applywbquote(quote: Quotes.Full, wbquote: Webull.Quote, toquote = {} as Quotes.Full) {
	let symbol = quote.symbol
	Object.keys(wbquote).forEach(k => {
		let wbvalue = wbquote[k]
		let keymap = KEY_MAP[k]
		if (!keymap) return;

		let qkey = keymap.key
		let qvalue = quote[qkey]
		if (qvalue == null) {
			toquote[qkey] = wbvalue
		}

		else if (keymap.greater || keymap.time) {
			if (wbvalue > qvalue) {
				toquote[qkey] = wbvalue
				if (keymap.time) {
					if (wbquote.tradeTime == wbquote.mktradeTime && wbquote.price && wbquote.price != quote.price) {
						toquote.price = wbquote.price
					}
					else if (wbquote.tradeTime == wbquote.faTradeTime && wbquote.pPrice && wbquote.pPrice != quote.price) {
						toquote.price = wbquote.pPrice
					}
				}
			}
		}

		else if (wbvalue != qvalue) {
			if (wbvalue > qvalue) {
				toquote[qkey] = wbvalue
			}
		}
	})

	if (toquote.status) {
		toquote.statusUpdatedAt = Date.now()
	}

	return toquote
}







