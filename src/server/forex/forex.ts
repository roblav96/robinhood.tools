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



async function readyFiats() {
	let exists = await redis.main.exists(rkeys.FOREX.SYMBOLS) as number
	if (exists == 0) await syncTickerIds(webull.fiats);
}
readyFiats().catch(function(error) {
	console.error('readyFiats Error ->', error)
}).then(onSymbols)

async function syncTickerIds(fiats: string[]) {
	let symbols = [] as string[]
	fiats.forEach(v => fiats.forEach(vv => {
		if (v == vv) return;
		symbols.push(v + vv)
	}))
	let tickers = await pAll(symbols.map(symbol => {
		return () => getTickerId(symbol)
	}), { concurrency: 1 })
	tickers = _.orderBy(tickers.filter(v => v), 'tickerSymbol')
	let fsymbols = {} as Dict<number>
	tickers.forEach(v => fsymbols[v.tickerSymbol] = v.tickerId)
	console.log('fsymbols ->', fsymbols)
	await redis.main.coms([
		['set', rkeys.FOREX.SYMBOLS, JSON.stringify(Object.keys(fsymbols))],
		['set', rkeys.FOREX.FSYMBOLS, JSON.stringify(fsymbols)],
	])
}

async function getTickerId(symbol: string) {
	let response = await http.get('https://infoapi.webull.com/api/search/tickers2', {
		query: { keys: symbol, tickerType: 6 }
	}) as Webull.Api.Paginated<Webull.Ticker>
	if (!Array.isArray(response.list)) return;
	let ticker = response.list.find(v => v.tickerSymbol == symbol)
	if (!ticker) return;
	return ticker
}



let QUOTES = {} as Dict<Quote>
let SAVES = {} as Dict<Quote>

async function onSymbols() {
	let fsymbols = await utils.getForexFullSymbols()
	let symbols = Object.keys(fsymbols)

	await webull.syncTickersQuotes(fsymbols)

	let coms = [] as Redis.Coms
	symbols.forEach(function(v) {
		coms.push(['hgetall', `${rkeys.WB.TICKERS}:${v}`])
		coms.push(['hgetall', `${rkeys.WB.QUOTES}:${v}`])
		coms.push(['hgetall', `${rkeys.QUOTES}:${v}`])
	})
	let resolved = await redis.main.coms(coms)
	resolved.forEach(core.fix)
	console.log('resolved ->', resolved)

	coms = []
	let ii = 0
	symbols.forEach(function(symbol) {
		let wbticker = resolved[ii++] as Webull.Ticker
		let wbquote = resolved[ii++] as Webull.Quote
		let quote = resolved[ii++] as Quote

		let toquote = {
			symbol,
			tickerId: fsymbols[symbol],
			type: 'forex',
			name: wbticker.name,
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

	await redis.main.coms(coms)

	watcher.options.fsymbols = fsymbols
	watcher.connect()

}

const watcher = new webull.MqttClient({
	connect: false,
	// verbose: true,
})
watcher.on('data', function(topic: number, wbquote: Webull.Quote) {
	// console.log('wbquote ->', topic, wbquote)
})

