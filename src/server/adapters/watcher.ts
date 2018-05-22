// // 

// import * as _ from '../../common/lodash'
// import * as core from '../../common/core'
// import * as rkeys from '../../common/rkeys'
// import * as pandora from '../adapters/pandora'
// import * as redis from '../adapters/redis'
// import * as socket from '../adapters/socket'
// import * as utils from '../adapters/utils'
// import * as webull from '../adapters/webull'
// import Emitter from '../../common/emitter'
// import clock from '../../common/clock'








// // emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
// // 	let symbol = wbquote.symbol
// // 	if (!QUOTES[symbol]) return console.warn('ondata !quote symbol ->', symbol);

// // 	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)
// // 	let toquote = onData(topic, wbquote)

// // 	if (Object.keys(toquote).length == 0) return;
// // 	// console.info(symbol, '->', webull.mqtt_topics[topic], toquote)
// // 	Object.assign(QUOTES[symbol], toquote)
// // 	Object.assign(EMITS[symbol], toquote)
// // 	Object.assign(SAVES[symbol], toquote)

// // })



// // function ondeal(quote: Quotes.Full, deal: Quotes.Deal, toquote = {} as Quotes.Full) {
// // 	let symbol = quote.symbol

// // 	toquote.deals++
// // 	if (deal.side == 'N') {
// // 		toquote.volume = quote.volume + deal.size
// // 	}


// // 	socket.emit(`${rkeys.DEALS}:${symbol}`, deal)
// // 	return toquote
// // }



// // const NOT_EQUALS = (({
// // 	'bid': ('bidPrice' as keyof Quotes.Full) as any,
// // 	'ask': ('askPrice' as keyof Quotes.Full) as any,
// // 	'bidSize': ('bidSize' as keyof Quotes.Full) as any,
// // 	'askSize': ('askSize' as keyof Quotes.Full) as any,
// // 	'deal': ('price' as keyof Quotes.Full) as any,
// // 	'price': ('price' as keyof Quotes.Full) as any,
// // 	'pPrice': ('price' as keyof Quotes.Full) as any,
// // 	'faStatus': ('status' as keyof Quotes.Full) as any,
// // 	'status': ('status' as keyof Quotes.Full) as any,
// // 	'status0': ('status' as keyof Quotes.Full) as any,
// // 	'open': ('openPrice' as keyof Quotes.Full) as any,
// // 	'close': ('closePrice' as keyof Quotes.Full) as any,
// // 	'preClose': ('prevClose' as keyof Quotes.Full) as any,
// // 	'high': ('dayHigh' as keyof Quotes.Full) as any,
// // 	'low': ('dayLow' as keyof Quotes.Full) as any,
// // 	'fiftyTwoWkHigh': ('yearHigh' as keyof Quotes.Full) as any,
// // 	'fiftyTwoWkLow': ('yearLow' as keyof Quotes.Full) as any,
// // 	'totalShares': ('sharesOutstanding' as keyof Quotes.Full) as any,
// // 	'outstandingShares': ('sharesFloat' as keyof Quotes.Full) as any,
// // 	'turnoverRate': ('turnoverRate' as keyof Quotes.Full) as any,
// // 	'vibrateRatio': ('vibrateRatio' as keyof Quotes.Full) as any,
// // 	'yield': ('yield' as keyof Quotes.Full) as any,
// // 	// '____': ('____' as keyof Quotes.Full) as any,
// // } as Webull.Quote) as any) as Dict<string>

// // const GREATER_THANS = (({
// // 	'faTradeTime': ('timestamp' as keyof Quotes.Full) as any,
// // 	'tradeTime': ('timestamp' as keyof Quotes.Full) as any,
// // 	'mktradeTime': ('timestamp' as keyof Quotes.Full) as any,
// // 	'dealNum': ('dealNum' as keyof Quotes.Full) as any,
// // 	'volume': ('volume' as keyof Quotes.Full) as any,
// // 	// '____': ('____' as keyof Quotes.Full) as any,
// // } as Webull.Quote) as any) as Dict<string>

// // // const OUT_RANGE = (({
// // // 	// '____': ('____' as keyof Quotes.Full) as any,
// // // 	// '____': ('____' as keyof Quotes.Full) as any,
// // // 	// '____': ('____' as keyof Quotes.Full) as any,
// // // } as Webull.Quote) as any) as Dict<string>

// // function onwbquote(quote: Quotes.Full, wbquote: Webull.Quote, toquote = {} as Quotes.Full) {
// // 	let symbol = quote.symbol
// // 	// console.log(`quote ->`, JSON.parse(JSON.stringify(quote)))
// // 	Object.keys(wbquote).forEach((k: keyof Quotes.Full) => {
// // 		let source = wbquote[k]
// // 		let key = NOT_EQUALS[k]
// // 		if (key) {
// // 			let target = quote[key]
// // 			if (target != source) {
// // 				toquote[key] = source
// // 			}
// // 			return
// // 		}
// // 		key = GREATER_THANS[k]
// // 		if (key) {
// // 			let target = quote[key]
// // 			if (target == null || source > target) {
// // 				toquote[key] = source
// // 			}
// // 			return
// // 		}
// // 	})
// // 	// console.log(`toquote ->`, JSON.parse(JSON.stringify(toquote)))
// // 	return toquote
// // }



// // function applycalcs(quote: Quotes.Full, toquote: Quotes.Full) {
// // 	let symbol = quote.symbol
// // 	if (toquote.price) {
// // 		toquote.close = toquote.price
// // 		toquote.change = toquote.price - quote.eodPrice
// // 		toquote.percent = core.calc.percent(toquote.price, quote.eodPrice)
// // 		toquote.marketCap = core.number.round(toquote.price * quote.sharesOutstanding)
// // 	}
// // 	if (toquote.askPrice || toquote.bidPrice) {
// // 		let bid = toquote.bidPrice || quote.bidPrice
// // 		let ask = toquote.askPrice || quote.askPrice
// // 		toquote.spread = ask - bid
// // 	}
// // }








// // } else if (key == 'volume') {
// // 	let volume = quote.volume
// // 	console.log('symbol ->', symbol)
// // 	console.log('volume ->', volume)
// // 	console.log('value ->', value)
// // 	if (value > volume || Math.abs(core.calc.percent(value, volume)) > 5) {
// // 		toquote.volume = value
// // 	}
// // 	// if (value > quote.volume && hours.rxstate.value == 'REGULAR') {
// // 	// if (value > quote.volume) {
// // 	// 	toquote.volume = value
// // 	// }
// // 	// let volume = quote.volume
// // 	// if (value == volume) return;
// // 	// if (value > volume || Math.abs(core.calc.percent(value, volume)) > 5) {
// // 	// 	toquote.volume = value
// // 	// }
// // 	// let percent = core.calc.percent(value, volume)
// // 	// if (percent > 95) return;
// // 	// if (value > volume || percent < -95) return toquote.volume = value;


