// 

import '../main'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as socket from '../adapters/socket'
import * as stocks from '../adapters/stocks'
import * as quotes from '../adapters/quotes'
import * as webull from '../adapters/webull'



const watcher = new webull.MqttClient({
	connect: false,
})
watcher.on('quote', function(wbquote) {
	socket.emit(`${rkeys.WB.QUOTES}:${wbquote.symbol}`, wbquote)
})

pandora.on('onsymbols', async function onsymbols() {
	let fsymbols = await stocks.getFullSymbols()
	watcher.options.fsymbols = fsymbols
	watcher.connect()

	let coms = [] as Redis.Coms
	let wbquotes = await webull.getFullQuotes(fsymbols)
	wbquotes.forEach(function(v) {
		let rkey = `${rkeys.WB.QUOTES}:${v.symbol}`
		coms.push(['hmset', rkey, v as any])
	})
	let wbtickers = await webull.getTickers(fsymbols)
	console.log('wbtickers ->', wbtickers)
	wbtickers.forEach(function(v) {
		let rkey = `${rkeys.WB.TICKERS}:${v.symbol}`
		coms.push(['hmset', rkey, v as any])
	})
	await redis.main.coms(coms)

	await quotes.onsymbols(fsymbols)

})


