// 

import '../main'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as socket from '../adapters/socket'
import * as webull from '../adapters/webull'
import clock from '../../common/clock'
const watcher = require('../adapters/watcher') as Webull.Watcher<Quotes.Full>
const { emitter, QUOTES, SAVES, EMITS } = watcher



watcher.rkey = rkeys.QUOTES

watcher.onSymbols = async function onsymbols(hubmsg, symbols) {
	let resets = hubmsg.action == 'symbols.reset'

	let resolved = await redis.main.coms(_.flatten(symbols.map(v => [
		['hgetall', `${rkeys.RH.INSTRUMENTS}:${v}`],
		['hgetall', `${rkeys.YH.QUOTES}:${v}`],
		['hgetall', `${rkeys.IEX.BATCH}:${v}`],
		['hgetall', `${rkeys.WB.TICKERS}:${v}`],
		['hgetall', `${rkeys.WB.QUOTES}:${v}`],
		['hgetall', `${rkeys.QUOTES}:${v}`],
	])))
	resolved.forEach(core.fix)

	let ii = 0
	symbols.forEach(function(symbol, i) {
		let instrument = resolved[ii++] as Robinhood.Instrument
		let yhquote = resolved[ii++] as Yahoo.Quote
		let iexbatch = resolved[ii++] as Iex.Batch
		let wbticker = resolved[ii++] as Webull.Ticker
		let wbquote = resolved[ii++] as Webull.Quote
		let quote = resolved[ii++] as Quotes.Full

		core.object.merge(quote, {
			symbol,
			tickerId: wbticker.tickerId,
			typeof: process.env.SYMBOLS,
			name: core.fallback(instrument.simple_name, yhquote.shortName, wbticker.tinyName, wbticker.name),
			fullName: core.fallback(instrument.name, yhquote.longName, wbticker.name),
			status: core.fallback(wbquote.faStatus, wbquote.status),
			alive: instrument.alive,
			mic: instrument.mic,
			acronym: instrument.acronym,
			listDate: new Date(instrument.list_date).valueOf(),
			country: core.fallback(instrument.country, wbticker.regionAlias).toUpperCase(),
			exchange: core.fallback(iexbatch.company.exchange, iexbatch.quote.primaryExchange),
			sharesOutstanding: _.round(core.fallback(wbquote.totalShares, yhquote.sharesOutstanding, iexbatch.stats.sharesOutstanding)),
			sharesFloat: _.round(core.fallback(wbquote.outstandingShares, iexbatch.stats.float)),
			avgVolume: _.round(core.fallback(wbquote.avgVolume, iexbatch.quote.avgTotalVolume)),
			avgVolume10Day: _.round(core.fallback(wbquote.avgVol10D, yhquote.averageDailyVolume10Day)),
			avgVolume3Month: _.round(core.fallback(wbquote.avgVol3M, yhquote.averageDailyVolume3Month)),
		} as Quotes.Full)

		core.object.repair(quote, applywbquote(quote, wbquote))

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

		QUOTES[symbol] = quote

	})

}



clock.on('5s', function onsave() {
	let symbols = Object.keys(SAVES).filter(k => Object.keys(SAVES[k]).length > 0)
	if (symbols.length == 0) return;
	let coms = []
	symbols.forEach(k => coms.push(['hmset', `${rkeys.QUOTES}:${k}`, SAVES[k]]))
	redis.main.coms(coms)
	symbols.forEach(k => SAVES[k] = {} as any)
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

	if (toquote.status) {
		toquote.statusUpdatedAt = Date.now()
	}

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
	gt: boolean
	time: boolean
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
	'dealNum': ({ key: 'dealNum', gt: true } as KeyMapValue) as any,
	'volume': ({ key: 'volume', gt: true } as KeyMapValue) as any,
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
		else if (keymap.gt || keymap.time) {
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
	return toquote
}





// const NOT_EQUALS = (({
// 	'faStatus': ('status' as keyof Quotes.Full) as any,
// 	'status': ('status' as keyof Quotes.Full) as any,
// 	'status0': ('status' as keyof Quotes.Full) as any,
// 	// 'deal': ('price' as keyof Quotes.Full) as any,
// 	// 'price': ('price' as keyof Quotes.Full) as any,
// 	// 'pPrice': ('price' as keyof Quotes.Full) as any,
// 	'open': ('openPrice' as keyof Quotes.Full) as any,
// 	'close': ('closePrice' as keyof Quotes.Full) as any,
// 	'preClose': ('prevClose' as keyof Quotes.Full) as any,
// 	// 'high': ('dayHigh' as keyof Quotes.Full) as any,
// 	// 'low': ('dayLow' as keyof Quotes.Full) as any,
// 	'fiftyTwoWkHigh': ('yearHigh' as keyof Quotes.Full) as any,
// 	'fiftyTwoWkLow': ('yearLow' as keyof Quotes.Full) as any,
// 	'bid': ('bidPrice' as keyof Quotes.Full) as any,
// 	'ask': ('askPrice' as keyof Quotes.Full) as any,
// 	'bidSize': ('bidSize' as keyof Quotes.Full) as any,
// 	'askSize': ('askSize' as keyof Quotes.Full) as any,
// 	'totalShares': ('sharesOutstanding' as keyof Quotes.Full) as any,
// 	'outstandingShares': ('sharesFloat' as keyof Quotes.Full) as any,
// 	'turnoverRate': ('turnoverRate' as keyof Quotes.Full) as any,
// 	'vibrateRatio': ('vibrateRatio' as keyof Quotes.Full) as any,
// 	'yield': ('yield' as keyof Quotes.Full) as any,
// 	// '____': ('____' as keyof Quotes.Full) as any,
// } as Webull.Quote) as any) as Dict<string>

// const TRADE_TIMES = (({
// 	'faTradeTime': ('timestamp' as keyof Quotes.Full) as any,
// 	'tradeTime': ('timestamp' as keyof Quotes.Full) as any,
// 	'mktradeTime': ('timestamp' as keyof Quotes.Full) as any,
// } as Webull.Quote) as any) as Dict<string>

// const GREATER_THANS = (({
// 	'dealNum': ('dealNum' as keyof Quotes.Full) as any,
// 	'volume': ('volume' as keyof Quotes.Full) as any,
// } as Webull.Quote) as any) as Dict<string>


