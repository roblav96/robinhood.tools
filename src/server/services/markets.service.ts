// 

import '../main'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as socket from '../adapters/socket'
import * as webull from '../adapters/webull'
import clock from '../../common/clock'
const watcher = require('../adapters/webull.watcher') as Webull.Watcher<Webull.Quote>
const { emitter, QUOTES, SAVES, EMITS } = watcher



watcher.rkey = rkeys.WB.QUOTES

watcher.onSymbols = async function onsymbols(hubmsg, symbols) {

	let resolved = await redis.main.coms(_.flatten(symbols.map(v => [
		['hgetall', `${rkeys.WB.TICKERS}:${v}`],
		['hgetall', `${rkeys.WB.QUOTES}:${v}`],
	])))
	resolved.forEach(core.fix)

	let ii = 0
	symbols.forEach(function(symbol, i) {
		let wbticker = resolved[ii++] as Webull.Ticker
		let wbquote = resolved[ii++] as Webull.Quote
		core.object.merge(wbquote, {
			symbol,
			tickerId: wbticker.tickerId,
			typeof: process.env.SYMBOLS,
			name: core.fallback(wbticker.tinyName, wbticker.name),
		})
		QUOTES[symbol] = wbquote
	})

}



const GREATER_THANS = {
	faTradeTime: 1,
	mktradeTime: 1,
	tradeTime: 1,
} as Webull.Quote

const DOES_RESET = {
	dealNum: 1,
	volume: 1,
} as Webull.Quote

emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	let quote = QUOTES[symbol]
	let toquote = {} as Webull.Quote
	if (!quote) return console.warn('ondata !quote symbol ->', symbol);

	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)
	Object.keys(wbquote).forEach(key => {
		let target = quote[key]
		let source = wbquote[key]
		if (GREATER_THANS[key]) {
			if (source > target) {
				toquote[key] = source
			}
		}
		else if (DOES_RESET[key]) {
			if (source > target || Math.abs(core.calc.percent(source, target)) > 5) {
				toquote[key] = source
			}
		}
		else if (source != target) {
			toquote[key] = source
		}
	})

	if (Object.keys(toquote).length == 0) return;
	// console.info(symbol, '->', webull.mqtt_topics[topic], toquote)
	core.object.merge(QUOTES[symbol], toquote)
	core.object.merge(EMITS[symbol], toquote)
	core.object.merge(SAVES[symbol], toquote)

})



clock.on('5s', function onsave() {
	let symbols = Object.keys(SAVES).filter(k => Object.keys(SAVES[k]).length > 0)
	if (symbols.length == 0) return;
	let coms = []
	symbols.forEach(k => coms.push(['hmset', `${rkeys.QUOTES}:${k}`, SAVES[k]]))
	redis.main.coms(coms)
	symbols.forEach(k => SAVES[k] = {} as any)
})


