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
import clock from '../../common/clock'



let QUOTES = {} as Dict<Quote>
let SAVES = {} as Dict<Quote>

onSymbols()
pandora.on('onSymbols', onSymbols)
async function onSymbols(hubmsg?: Pandora.HubMessage<Symbols.OnSymbolsData>) {
	if (hubmsg && hubmsg.data.type != 'FOREX') return;
	let fsymbols = await utils.getFullSymbols('FOREX')
	if (_.isEmpty(fsymbols)) return;
	let symbols = Object.keys(fsymbols)

	await webull.syncTickersQuotes(fsymbols)

	let resolved = await redis.main.coms(_.flatten(symbols.map(v => {
		return [
			['hgetall', `${rkeys.WB.TICKERS}:${v}`],
			['hgetall', `${rkeys.WB.QUOTES}:${v}`],
			['hgetall', `${rkeys.QUOTES}:${v}`],
		]
	})))
	resolved.forEach(core.fix)
	
	console.log('resolved ->', resolved)

	let coms = []
	let ii = 0
	symbols.forEach(function(symbol) {
		let wbticker = resolved[ii++] as Webull.Ticker
		let wbquote = resolved[ii++] as Webull.Quote
		let quote = resolved[ii++] as Quote

		let toquote = {
			symbol,
			tickerId: fsymbols[symbol],
			typeof: 'FOREX',
		} as Quote
		webull.parseStatus(quote, toquote, wbquote)
		webull.parseTicker(quote, toquote, wbquote)
		webull.parseBidAsk(quote, toquote, wbquote)
		Object.assign(quote, toquote)

		QUOTES[symbol] = quote
		SAVES[symbol] = {} as any

		let rkey = `${rkeys.QUOTES}:${symbol}`
		coms.push(['hmset', rkey, quote as any])
		socket.emit(rkey, quote)

	})

	// await redis.main.coms(coms)

	// watcher.options.fsymbols = fsymbols
	// watcher.connect()

}

const watcher = new webull.MqttClient({
	connect: false,
	// verbose: true,
})
watcher.on('data', function(topic: number, wbquote: Webull.Quote) {
	// console.log('wbquote ->', topic, wbquote)
})

