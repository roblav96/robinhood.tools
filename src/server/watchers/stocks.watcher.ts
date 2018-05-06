// 

import '../main'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as socket from '../adapters/socket'
import * as stocks from '../adapters/stocks'
import * as webull from '../adapters/webull'



const watcher = new webull.MqttClient({
	connect: false,
})
watcher.on('quote', function(quote) {
	socket.emit(`${rkeys.WB.QUOTES}:${quote.symbol}`, quote)
})

async function onchunkSymbols() {
	let fsymbols = await stocks.getFullSymbols()
	watcher.options.fsymbols = fsymbols
	watcher.connect()
	let quotes = await webull.getFullQuotes(fsymbols)
	let coms = quotes.map(function(v) {
		let rkey = `${rkeys.WB.QUOTES}:${v.symbol}`
		socket.emit(rkey, v)
		return ['hmset', rkey, v as any]
	})
	await redis.main.coms(coms)
}
pandora.on('chunkSymbols', onchunkSymbols)


