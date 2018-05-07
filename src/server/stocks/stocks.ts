// 

import '../main'
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
import clock from '../../common/clock'



let QUOTES = {} as Dict<Quote>
let SAVES = {} as Dict<Quote>

async function onSymbols(hubmsg?: any) {
	let reset = !!hubmsg
	let fsymbols = await utils.getFullSymbols()
	if (_.isEmpty(fsymbols)) return;
	let symbols = Object.keys(fsymbols)

	await webull.syncTickersQuotes(fsymbols)

	let gcoms = [] as Redis.Coms
	symbols.forEach(function(v) {
		gcoms.push(['hgetall', `${rkeys.RH.INSTRUMENTS}:${v}`])
		gcoms.push(['hgetall', `${rkeys.WB.TICKERS}:${v}`])
		gcoms.push(['hgetall', `${rkeys.WB.QUOTES}:${v}`])
		gcoms.push(['hgetall', `${rkeys.QUOTES}:${v}`])
	})
	let resolved = await redis.main.coms(gcoms)
	resolved.forEach(core.fix)

	let scoms = []
	let ii = 0
	symbols.forEach(function(symbol) {
		let instrument = resolved[ii++] as Robinhood.Instrument
		let wbticker = resolved[ii++] as Webull.Ticker
		let wbquote = resolved[ii++] as Webull.Quote
		let quote = resolved[ii++] as Quote

		quote.symbol = symbol
		quote.tickerId = fsymbols[symbol]
		quote.updated = wbquote.tradeTime
		quote.status = wbquote.status

		quote.name = instrument.simple_name || instrument.name
		quote.tradable = instrument.alive
		quote.type = instrument.type
		quote.listDate = new Date(instrument.list_date).valueOf()
		quote.mic = instrument.mic
		quote.acronym = instrument.acronym
		quote.country = instrument.country

		quote.price = wbquote.price
		quote.openPrice = wbquote.open
		quote.closePrice = wbquote.close
		quote.prevClose = wbquote.preClose
		quote.yearHigh = wbquote.fiftyTwoWkHigh
		quote.yearLow = wbquote.fiftyTwoWkLow
		quote.dayHigh = wbquote.high
		quote.dayLow = wbquote.low

		quote.bidPrice = wbquote.bid
		quote.askPrice = wbquote.ask
		quote.bidSize = wbquote.bidSize
		quote.askSize = wbquote.askSize

		quote.dealCount = wbquote.dealNum
		quote.avgVolume = wbquote.avgVolume
		quote.avgVolume10Day = wbquote.avgVol10D
		quote.avgVolume3Month = wbquote.avgVol3M
		quote.volume = wbquote.volume

		quote.sharesOutstanding = wbquote.totalShares
		quote.sharesFloat = wbquote.outstandingShares
		quote.marketCap = Math.round(quote.price * quote.sharesOutstanding)

		QUOTES[symbol] = quote
		SAVES[symbol] = {} as any

		let rkey = `${rkeys.QUOTES}:${symbol}`
		scoms.push(['hmset', rkey, quote])
		socket.emit(rkey, quote)

	})

	await redis.main.coms(scoms)

	watcher.options.fsymbols = fsymbols
	watcher.connect()

}
onSymbols()
pandora.on('onSymbols', onSymbols)



const watcher = new webull.MqttClient({
	connect: false,
})
watcher.on('data', function(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	let quote = QUOTES[symbol]

	let toquote = {} as Quote
	let fa = hours.rxstate.value != 'REGULAR'

	if (topic == webull.topics.TICKER_STATUS) {
		if (!fa && wbquote.status && wbquote.status != quote.status) {
			toquote.status = wbquote.status
		}
		if (fa && wbquote.faStatus && wbquote.faStatus != quote.status) {
			toquote.status = wbquote.faStatus
		}
	}

	if ([
		webull.topics.TICKER,
		webull.topics.TICKER_DETAIL,
		webull.topics.TICKER_HANDICAP,
	].includes(topic)) {
		if (wbquote.tradeTime && wbquote.tradeTime > quote.updated) {
			toquote.updated = wbquote.tradeTime
			if (Number.isFinite(wbquote.price) && wbquote.price > 0) {
				if (wbquote.tradeTime == wbquote.mkTradeTime) toquote.price = wbquote.price;
				if (wbquote.tradeTime == wbquote.mktradeTime) toquote.price = wbquote.price;
			}
			if (Number.isFinite(wbquote.pPrice) && wbquote.pPrice > 0) {
				if (wbquote.tradeTime == wbquote.faTradeTime) toquote.price = wbquote.pPrice;
			}
			if (toquote.price) {
				toquote.marketCap = Math.round(toquote.price * quote.sharesOutstanding)
			}
		}
		if (wbquote.volume && wbquote.volume > quote.volume) toquote.volume = wbquote.volume;
		if (wbquote.open && wbquote.open != quote.openPrice) toquote.openPrice = wbquote.open;
		if (wbquote.close && wbquote.close != quote.closePrice) toquote.closePrice = wbquote.close;
		if (wbquote.preClose && wbquote.preClose != quote.prevClose) toquote.prevClose = wbquote.preClose;
		if (wbquote.high && wbquote.high != quote.dayHigh) toquote.dayHigh = wbquote.high;
		if (wbquote.low && wbquote.low != quote.dayLow) toquote.dayLow = wbquote.low;
		if (wbquote.fiftyTwoWkHigh && wbquote.fiftyTwoWkHigh != quote.yearHigh) toquote.yearHigh = wbquote.fiftyTwoWkHigh;
		if (wbquote.fiftyTwoWkLow && wbquote.fiftyTwoWkLow != quote.yearLow) toquote.yearLow = wbquote.fiftyTwoWkLow;
		if (wbquote.totalShares && wbquote.totalShares != quote.sharesOutstanding) toquote.sharesOutstanding = wbquote.totalShares;
		if (wbquote.outstandingShares && wbquote.outstandingShares != quote.sharesFloat) toquote.sharesFloat = wbquote.outstandingShares;
		if (wbquote.dealNum && wbquote.dealNum > quote.dealCount) toquote.dealCount = wbquote.dealNum;
	}

	if (topic == webull.topics.TICKER_BID_ASK) {
		if (wbquote.bid && wbquote.bid != quote.bidPrice) toquote.bidPrice = wbquote.bid;
		if (wbquote.bidSize && wbquote.bidSize != quote.bidSize) toquote.bidSize = wbquote.bidSize;
		if (wbquote.ask && wbquote.ask != quote.askPrice) toquote.askPrice = wbquote.ask;
		if (wbquote.askSize && wbquote.askSize != quote.askSize) toquote.askSize = wbquote.askSize;
	}

	if (topic == webull.topics.TICKER_DEAL_DETAILS) {
		if (wbquote.tradeTime && wbquote.tradeTime > quote.updated) {
			toquote.updated = wbquote.tradeTime
			toquote.price = wbquote.deal
		}
		if (wbquote.volume) {
			if (wbquote.tradeBsFlag == 'B') {
				toquote.buyVolume = quote.buyVolume + wbquote.volume
			} else if (wbquote.tradeBsFlag == 'S') {
				toquote.sellVolume = quote.sellVolume + wbquote.volume
			} else {
				toquote.volume = quote.volume + wbquote.volume
			}
		}
		socket.emit(`${rkeys.DEALS}:${symbol}`, {
			symbol,
			price: wbquote.deal,
			size: wbquote.volume,
			side: wbquote.tradeBsFlag,
			time: wbquote.tradeTime,
		} as Quote.Deal)
	}

	if (Object.keys(toquote).length == 0) return;
	Object.assign(QUOTES[symbol], toquote)
	Object.assign(SAVES[symbol], toquote)
	socket.emit(`${rkeys.QUOTES}:${symbol}`, toquote)

})



clock.on('3s', async function onsave() {
	let coms = Object.keys(SAVES).filter(symbol => {
		return Object.keys(SAVES[symbol]).length > 0
	}).map(symbol => {
		return ['hmset', `${rkeys.QUOTES}:${symbol}`, SAVES[symbol]]
	})
	redis.main.coms(coms as any)
	Object.keys(SAVES).forEach(symbol => SAVES[symbol] = {} as any)
})


