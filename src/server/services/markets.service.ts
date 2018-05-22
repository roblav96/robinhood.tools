// // 

// import '../main'
// import * as _ from '../../common/lodash'
// import * as core from '../../common/core'
// import * as rkeys from '../../common/rkeys'
// import * as redis from '../adapters/redis'
// import * as socket from '../adapters/socket'
// import * as webull from '../adapters/webull'
// import clock from '../../common/clock'
// const watcher = require('../adapters/watcher') as Webull.Watcher<Webull.Quote>
// const { emitter, QUOTES, SAVES, EMITS } = watcher



// watcher.RKEY = rkeys.WB.QUOTES

// watcher.onSymbols = async function onsymbols(hubmsg, symbols) {

// 	let resolved = await redis.main.coms(_.flatten(symbols.map(v => [
// 		['hgetall', `${rkeys.WB.TICKERS}:${v}`],
// 		['hgetall', `${rkeys.WB.QUOTES}:${v}`],
// 	])))
// 	resolved.forEach(core.fix)

// 	let ii = 0
// 	symbols.forEach(function(symbol, i) {
// 		let wbticker = resolved[ii++] as Webull.Ticker
// 		let wbquote = resolved[ii++] as Webull.Quote
// 		console.log(`wbquote ->`, wbquote)
// 		core.object.merge(wbquote, {
// 			symbol,
// 			tickerId: wbticker.tickerId,
// 			typeof: process.env.SYMBOLS,
// 			name: core.fallback(wbticker.tinyName, wbticker.name),
// 		})
// 		QUOTES[symbol] = wbquote
// 	})

// }



// type TKeyMapValue = KeyMapValue<Webull.Quote>
// const KEY_MAP = (({
// 	faStatus: ({ greater: true } as TKeyMapValue) as any,
// 	faTradeTime: ({ greater: true } as TKeyMapValue) as any,
// 	mktradeTime: ({ greater: true } as TKeyMapValue) as any,
// 	tradeTime: ({ greater: true } as TKeyMapValue) as any,
// 	dealNum: ({ greater: true, resets: true } as TKeyMapValue) as any,
// 	volume: ({ greater: true, resets: true } as TKeyMapValue) as any,
// } as Webull.Quote) as any) as Dict<TKeyMapValue>

// emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
// 	let symbol = wbquote.symbol
// 	let quote = QUOTES[symbol]
// 	let toquote = {} as Webull.Quote
// 	if (!quote) return console.warn('ondata !quote symbol ->', symbol);
// 	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)

// 	Object.keys(wbquote).forEach(k => {
// 		let target = quote[k]
// 		let source = wbquote[k]
// 		let keymap = KEY_MAP[k]
// 		if (keymap) {
// 			if (keymap.greater && source > target) {
// 				toquote[k] = source
// 			}
// 			if (keymap.resets && Math.abs(core.calc.percent(source, target)) > 50) {
// 				toquote[k] = source
// 			}
// 		}
// 		else if (source != target) {
// 			toquote[k] = source
// 		}
// 	})

// 	if (Object.keys(toquote).length == 0) return;
// 	core.object.merge(QUOTES[symbol], toquote)
// 	core.object.merge(EMITS[symbol], toquote)
// 	core.object.merge(SAVES[symbol], toquote)
// 	// console.info(symbol, '->', webull.mqtt_topics[topic], toquote)

// })



// clock.on('5s', function onsave() {
// 	let symbols = Object.keys(SAVES).filter(k => Object.keys(SAVES[k]).length > 0)
// 	if (symbols.length == 0) return;
// 	let coms = []
// 	symbols.forEach(v => coms.push(['hmset', `${rkeys.QUOTES}:${v}`, SAVES[v]]))
// 	redis.main.coms(coms)
// 	symbols.forEach(v => Object.assign(SAVES, { [v]: {} }))
// })


