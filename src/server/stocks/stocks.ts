// 

import '../main'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as socket from '../adapters/socket'
import * as utils from '../adapters/utils'
import * as webull from '../adapters/webull'



async function onSymbols() {
	let fsymbols = await utils.getFullSymbols()
	if (_.isEmpty(fsymbols)) return;
	let symbols = Object.keys(fsymbols)

	symbols.splice(10)

	await webull.syncTickersQuotes(fsymbols)

	let coms = [] as Redis.Coms
	symbols.forEach(function(v) {
		coms.push(['hgetall', `${rkeys.RH.INSTRUMENTS}:${v}`])
		coms.push(['hgetall', `${rkeys.WB.TICKERS}:${v}`])
		coms.push(['hgetall', `${rkeys.WB.QUOTES}:${v}`])
		coms.push(['hgetall', `${rkeys.QUOTES}:${v}`])
	})
	let resolved = await redis.main.coms(coms)
	resolved.forEach(core.fix)

	coms = []
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

	})

	await redis.main.coms(coms)

	watcher.options.fsymbols = fsymbols
	watcher.connect()

}
onSymbols()
pandora.on('onSymbols', onSymbols)



const watcher = new webull.MqttClient({
	connect: false,
})
watcher.on('quote', function(wbquote) {
	socket.emit(`${rkeys.WB.QUOTES}:${wbquote.symbol}`, wbquote)
})


