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
import * as iex from '../adapters/iex'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'



const emitter = new Emitter<'connect' | 'subscribed' | 'disconnect' | 'data'>()
const CLIENTS = [] as webull.MqttClient[]
clock.on('5s', function onconnect() {
	if (CLIENTS.length == 0) return;
	let client = CLIENTS.find(v => v.started == false)
	if (!client) return;
	client.connect()
})

const WB_QUOTES = {} as Dict<Webull.Quote>
const WB_EMITS = {} as Dict<Webull.Quote>
const WB_SAVES = {} as Dict<Webull.Quote>
const QUOTES = {} as Dict<Quotes.Quote>
const EMITS = {} as Dict<Quotes.Quote>
const SAVES = {} as Dict<Quotes.Quote>

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
	if (process.env.DEVELOPMENT && +process.env.SCALE == 1) fsymbols = utils[`DEV_${process.env.SYMBOLS}`];
	let symbols = Object.keys(fsymbols)

	CLIENTS.forEach(v => v.destroy())
	clock.offListener(onsocket)
	clock.offListener(onsave)
	core.nullify(WB_QUOTES)
	core.nullify(WB_EMITS)
	core.nullify(WB_SAVES)
	core.nullify(QUOTES)
	core.nullify(EMITS)
	core.nullify(SAVES)

	let resolved = await redis.main.coms(_.flatten(symbols.map(v => [
		['hgetall', `${rkeys.QUOTES}:${v}`],
		['hgetall', `${rkeys.WB.TICKERS}:${v}`],
		['hgetall', `${rkeys.WB.QUOTES}:${v}`],
		['hgetall', `${rkeys.RH.INSTRUMENTS}:${v}`],
		['hgetall', `${rkeys.YH.QUOTES}:${v}`],
		['hgetall', `${rkeys.IEX.ITEMS}:${v}`],
	])))
	resolved.forEach(core.fix)

	let ii = 0
	let coms = [] as Redis.Coms
	symbols.forEach(function(symbol, i) {
		let quote = resolved[ii++] as Quotes.Quote
		let wbticker = resolved[ii++] as Webull.Ticker
		let wbquote = resolved[ii++] as Webull.Quote
		let instrument = resolved[ii++] as Robinhood.Instrument
		let yhquote = resolved[ii++] as Yahoo.Quote
		let iexitem = resolved[ii++] as Iex.Item

		core.object.merge(quote, {
			symbol,
			tickerId: wbticker.tickerId,
			typeof: process.env.SYMBOLS,
			name: core.fallback(iexitem.companyName, instrument.simple_name, yhquote.shortName, wbticker.tinyName, wbticker.name),
			fullName: core.fallback(instrument.name, yhquote.longName, wbticker.name),
			country: core.fallback(instrument.country, wbquote.countryISOCode, wbquote.regionAlias),
			timezone: wbquote.utcOffset,
			issueType: iexitem.issueType,
			currency: wbquote.currency,
			sector: iexitem.sector,
			industry: iexitem.industry,
			website: iexitem.website,
			description: iexitem.description,
			alive: instrument.alive,
			mic: instrument.mic,
			acronym: instrument.acronym,
			listDate: new Date(instrument.list_date).valueOf(),
			exchange: core.fallback(iexitem.exchange, iexitem.primaryExchange, wbticker.exchangeCode, wbticker.disExchangeCode),
			sharesOutstanding: _.round(core.fallback(wbquote.totalShares, yhquote.sharesOutstanding, iexitem.sharesOutstanding)),
			sharesFloat: _.round(core.fallback(wbquote.outstandingShares, iexitem.float)),
		} as Quotes.Quote)

		if (quote.name == quote.fullName) delete quote.fullName;
		quote.avgVolume10Day = _.round(core.fallback(wbquote.avgVol10D, yhquote.averageDailyVolume10Day))
		quote.avgVolume3Month = _.round(core.fallback(wbquote.avgVol3M, yhquote.averageDailyVolume3Month))
		quote.avgVolume = _.round(core.fallback(wbquote.avgVolume, iexitem.avgTotalVolume))
		if (!quote.avgVolume) quote.avgVolume = _.round(quote.avgVolume10Day, quote.avgVolume3Month);

		let toquote = applywbquote(quote, wbquote)
		core.object.repair(quote, toquote)

		let reset = {
			eodPrice: quote.price,
			dayHigh: quote.price, dayLow: quote.price,
			open: quote.price, high: quote.price, low: quote.price, close: quote.price,
			count: 0, deals: 0,
			bidVolume: 0, askVolume: 0,
			volume: 0, size: 0,
			dealVolume: 0, dealSize: 0,
			buyVolume: 0, buySize: 0,
			sellVolume: 0, sellSize: 0,
		} as Quotes.Quote
		core.object.repair(quote, reset)
		if (resets) core.object.merge(quote, reset);

		applycalcs(quote, quote)
		core.object.clean(quote)

		// if (process.env.DEVELOPMENT && +process.env.SCALE == 1) {
		// 	console.warn(symbol, '->', quote.name)
		// 	// console.log(`quote ->`, JSON.parse(JSON.stringify(quote)))
		// 	console.log('wbticker ->', wbticker)
		// 	console.log('wbquote ->', wbquote)
		// 	// console.log('instrument ->', instrument)
		// 	// console.log('yhquote ->', yhquote)
		// 	// console.log('iexitem ->', iexitem)
		// 	console.log(`quote ->`, quote)
		// }

		WB_QUOTES[symbol] = Object.assign({
			typeof: quote.typeof, name: quote.name,
		} as Webull.Quote, wbquote)
		Object.assign(WB_EMITS, { [symbol]: {} })
		Object.assign(WB_SAVES, { [symbol]: {} })
		Object.assign(QUOTES, { [symbol]: quote })
		Object.assign(EMITS, { [symbol]: {} })
		Object.assign(SAVES, { [symbol]: {} })

		let rkey = `${rkeys.QUOTES}:${symbol}`
		socket.emit(rkey, quote)
		coms.push(['hmset', rkey, quote as any])

	})

	await redis.main.coms(coms)
	pandora.broadcast({}, 'quotes.ready')

	let chunks = core.array.chunks(_.toPairs(fsymbols), _.ceil(symbols.length / 128))
	CLIENTS.splice(0, Infinity, ...chunks.map((chunk, i) => new webull.MqttClient({
		fsymbols: _.fromPairs(chunk),
		topics: process.env.SYMBOLS,
		index: i, chunks: chunks.length,
		connect: chunks.length == 1 && i == 0,
		// verbose: true,
	}, emitter)))

	clock.on('1s', onsocket)
	clock.on('10s', onsave)

}



function onsocket() {
	[rkeys.WB.QUOTES, rkeys.QUOTES].forEach((rkey, i) => {
		let emits = i == 0 ? WB_EMITS : EMITS
		Object.keys(emits).forEach(symbol => {
			let quote = emits[symbol]
			if (Object.keys(quote).length == 0) return;
			quote.symbol = symbol
			socket.emit(`${rkey}:${symbol}`, quote)
			Object.assign(emits, { [symbol]: {} })
		})
	})
}

function onsave() {
	let coms = []

	Object.keys(WB_SAVES).forEach(symbol => {
		let quote = WB_SAVES[symbol]
		if (Object.keys(quote).length == 0) return;
		coms.push(['hmset', `${rkeys.WB.QUOTES}:${symbol}`, quote as any])
		Object.assign(WB_SAVES, { [symbol]: {} })
	})

	Object.keys(SAVES).forEach(symbol => {
		let quote = SAVES[symbol]
		if (Object.keys(quote).length == 0) return;
		coms.push(['hmset', `${rkeys.QUOTES}:${symbol}`, quote as any])
		Object.assign(SAVES, { [symbol]: {} })
	})

	if (coms.length == 0) return;
	redis.main.coms(coms)

}



emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	let quote = WB_QUOTES[symbol]
	let toquote = {} as Webull.Quote
	if (!quote) return console.warn('WB_QUOTES ondata !quote symbol ->', symbol);
	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)

	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) return;

	Object.keys(wbquote).forEach(k => {
		let source = wbquote[k]
		let target = quote[k]
		// if (target == null) { target = source; quote[k] = source; toquote[k] = source }
		if (target == null) {
			console.warn(`target == null`)
		}
		let keymap = KEY_MAP[k]
		if (keymap) {
			if (keymap.time && source > target) {
				toquote[k] = source
			}
			else if (keymap.greater && (source > target || Math.abs(core.calc.percent(source, target)) > 50)) {
				toquote[k] = source
			}
		}
		else if (source != target) {
			toquote[k] = source
		}
	})

	let tokeys = Object.keys(toquote)
	if (tokeys.length == 0) return;

	// let diff = tokeys.reduce((item, key) => { item[key] = from[key]; return item }, {})
	// console.info(symbol, '->', webull.mqtt_topics[topic], diff, toquote)

	core.object.merge(WB_QUOTES[symbol], toquote)
	core.object.merge(WB_EMITS[symbol], toquote)
	core.object.merge(WB_SAVES[symbol], toquote)

})



emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	let quote = QUOTES[symbol]
	let toquote = {} as Quotes.Quote
	if (!quote) return console.warn('QUOTES ondata !quote symbol ->', symbol);
	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)

	let from = core.clone(quote)
	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
		applywbdeal(quote, wbquote, toquote)
	} else {
		applywbquote(quote, wbquote, toquote)
	}

	let tokeys = Object.keys(toquote)
	if (tokeys.length == 0) return;

	// let diff = tokeys.reduce((item, key) => { item[key] = from[key]; return item }, {})
	// console.info(symbol, '->', webull.mqtt_topics[topic], diff, toquote)

	applycalcs(quote, toquote)
	core.object.merge(QUOTES[symbol], toquote)
	core.object.merge(EMITS[symbol], toquote)
	core.object.merge(SAVES[symbol], toquote)

})



function applycalcs(quote: Quotes.Quote, toquote: Quotes.Quote) {
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



function applywbdeal(quote: Quotes.Quote, wbdeal: Webull.Deal, toquote = {} as Quotes.Quote) {
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
	key: keyof Quotes.Quote
	time: boolean, greater: boolean,
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
	'dealNum': ({ key: 'deals', greater: true } as KeyMapValue) as any,
	'volume': ({ key: 'volume', greater: true } as KeyMapValue) as any,
	'dealAmount': ({ greater: true } as KeyMapValue) as any,
	// '____': ({ key: '____' } as KeyMapValue) as any,
} as Webull.Quote) as any) as Dict<KeyMapValue>



function applywbquote(quote: Quotes.Quote, wbquote: Webull.Quote, toquote = {} as Quotes.Quote) {
	let symbol = quote.symbol
	Object.keys(wbquote).forEach(k => {
		let wbvalue = wbquote[k]
		let keymap = KEY_MAP[k]
		if (!keymap || !keymap.key) return;
		let qkey = keymap.key
		let qvalue = quote[qkey]
		if (qvalue == null) { qvalue = wbvalue; quote[qkey] = wbvalue; toquote[qkey] = wbvalue }
		// console.log(k, '->', wbvalue, '->', qkey, '->', qvalue, '->', quote[qkey])

		if (keymap.time) {
			if (wbvalue > qvalue) toquote[qkey] = wbvalue;
			if (wbquote.tradeTime == wbquote.mktradeTime && wbquote.price && wbquote.price != quote.price) {
				toquote.price = wbquote.price
			}
			if (wbquote.tradeTime == wbquote.faTradeTime && wbquote.pPrice && wbquote.pPrice != quote.price) {
				toquote.price = wbquote.pPrice
			}
		} else if (keymap.greater) {
			if (wbvalue > qvalue) {
				toquote[qkey] = wbvalue
			}
		} else if (wbvalue != qvalue) {
			toquote[qkey] = wbvalue
		}

	})

	if (toquote.status) {
		toquote.statusUpdatedAt = Date.now()
	}

	return toquote
}




