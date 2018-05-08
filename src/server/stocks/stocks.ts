// 

import '../main'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as schedule from 'node-schedule'
import * as Pandora from 'pandora'
import * as Hub from 'pandora-hub'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as hours from '../adapters/hours'
import * as socket from '../adapters/socket'
import * as utils from '../adapters/utils'
import * as webull from '../adapters/webull'
import clock from '../../common/clock'



let QUOTES = {} as Dict<Quote>
let SAVES = {} as Dict<Quote>

async function onStocks(hubmsg?: any) {
	let reset = _.get(hubmsg, 'data.reset', false)
	let fsymbols = await utils.getInstanceFullSymbols('STOCKS')
	if (process.env.DEVELOPMENT) fsymbols = utils.devfsymbols;
	let symbols = Object.keys(fsymbols)

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

		let toquote = {
			symbol,
			tickerId: fsymbols[symbol],
			typeof: 'STOCKS',
			name: instrument.name,
			tradable: instrument.alive,
			listDate: new Date(instrument.list_date).valueOf(),
			mic: instrument.mic,
			acronym: instrument.acronym,
			country: instrument.country,
		} as Quote
		webull.parseStatus(quote, toquote, wbquote)
		webull.parseTicker(quote, toquote, wbquote)
		webull.parseBidAsk(quote, toquote, wbquote)
		Object.assign(quote, toquote)

		if (reset) {
			Object.assign(quote, {
				volume: 0, dealCount: 0,
				buyVolume: 0, sellVolume: 0,
			} as Quote)
		}

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
onStocks()
pandora.on('onStocks', onStocks)
schedule.scheduleJob('00 8 * * 1-5', onStocks)



const watcher = new webull.MqttClient({
	connect: false,
	// verbose: true,
})
watcher.on('data', function(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	let quote = QUOTES[symbol]
	let toquote: Quote

	if (topic == webull.mqtt_topics.TICKER_STATUS) {
		toquote = webull.onQuote({ quote, wbquote, filter: 'status' })

	} else if (topic == webull.mqtt_topics.TICKER_BID_ASK) {
		toquote = webull.onQuote({ quote, wbquote })

	}

	if ([
		webull.mqtt_topics.TICKER,
		webull.mqtt_topics.TICKER_DETAIL,
		webull.mqtt_topics.TICKER_HANDICAP,
	].includes(topic)) {
		webull.parseTicker(quote, toquote, wbquote)
	}

	if (topic == webull.mqtt_topics.TICKER_BID_ASK) {
		webull.parseBidAsk(quote, toquote, wbquote)
	}

	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
		let wbdeal = (wbquote as any) as Webull.Deal
		webull.parseDeal(quote, toquote, wbdeal)
		socket.emit(`${rkeys.DEALS}:${symbol}`, {
			symbol,
			price: wbdeal.deal,
			size: wbdeal.volume,
			side: wbdeal.tradeBsFlag,
			time: wbdeal.tradeTime,
		} as Quote.Deal)
	}

	if (Object.keys(toquote).length == 0) return;
	Object.assign(QUOTES[symbol], toquote)
	Object.assign(SAVES[symbol], toquote)
	socket.emit(`${rkeys.QUOTES}:${symbol}`, toquote)

})



clock.on('3s', function onsave() {
	let coms = Object.keys(SAVES).filter(symbol => {
		return Object.keys(SAVES[symbol]).length > 0
	}).map(symbol => {
		return ['hmset', `${rkeys.QUOTES}:${symbol}`, SAVES[symbol]]
	})
	redis.main.coms(coms as any)
	Object.keys(SAVES).forEach(symbol => SAVES[symbol] = {} as any)
})


