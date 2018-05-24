// 

import '../main'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as utils from '../adapters/utils'
import * as redis from '../adapters/redis'
import * as socket from '../adapters/socket'
import * as webull from '../adapters/webull'
import * as iex from '../adapters/iex'
import * as quotes from '../adapters/quotes'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'



const emitter = new Emitter<'connect' | 'subscribed' | 'disconnect' | 'data'>()
const CLIENTS = [] as webull.MqttClient[]
clock.on('5s', function onconnect() {
	if (CLIENTS.length == 0) return;
	let client = CLIENTS.find(v => v.started == false)
	if (!client) return;
	client.connect()
})

const WB_QUOTES = {} as Dict<Webull.Quote>
const WB_EMITS = {} as Dict<Webull.Quote>
const WB_SAVES = {} as Dict<Webull.Quote>
const QUOTES = {} as Dict<Quotes.Quote>
const EMITS = {} as Dict<Quotes.Quote>
const SAVES = {} as Dict<Quotes.Quote>

pandora.once('symbols.ready', onsymbols)
pandora.broadcast({}, 'symbols.start')
async function onsymbols() {

	CLIENTS.forEach(v => v.destroy())
	clock.offListener(onsocket)
	clock.offListener(onsave)
	core.nullify(WB_QUOTES)
	core.nullify(WB_EMITS)
	core.nullify(WB_SAVES)
	core.nullify(QUOTES)
	core.nullify(EMITS)
	core.nullify(SAVES)

	let fsymbols = (process.env.SYMBOLS == 'STOCKS' ?
		await utils.getInstanceFullSymbols(process.env.SYMBOLS) :
		await utils.getFullSymbols(process.env.SYMBOLS)
	)
	// if (process.env.DEVELOPMENT) return;
	// if (process.env.DEVELOPMENT && +process.env.SCALE == 1) fsymbols = utils[`DEV_${process.env.SYMBOLS}`];
	let symbols = Object.keys(fsymbols)

	let alls = await quotes.getAlls(symbols)
	let coms = alls.map(all => {
		let symbol = all.symbol

		quotes.initquote(all)

		Object.assign(WB_QUOTES, { [symbol]: all.wbquote })
		Object.assign(WB_EMITS, { [symbol]: {} })
		Object.assign(WB_SAVES, { [symbol]: {} })
		Object.assign(QUOTES, { [symbol]: all.quote })
		Object.assign(EMITS, { [symbol]: {} })
		Object.assign(SAVES, { [symbol]: {} })

		let rkey = `${rkeys.QUOTES}:${symbol}`
		socket.emit(rkey, all.quote)
		return ['hmset', rkey, all.quote as any]

	})

	await redis.main.coms(coms)
	pandora.broadcast({}, 'quotes.ready')

	let chunks = core.array.chunks(_.toPairs(fsymbols), _.ceil(symbols.length / 256))
	CLIENTS.splice(0, Infinity, ...chunks.map((chunk, i) => new webull.MqttClient({
		fsymbols: _.fromPairs(chunk),
		topics: process.env.SYMBOLS,
		index: i, chunks: chunks.length,
		connect: chunks.length == 1 && i == 0,
		// verbose: true,
	}, emitter)))

	clock.on('1s', onsocket)
	clock.on('10s', onsave)

}



function onsocket() {
	[rkeys.WB.QUOTES, rkeys.QUOTES].forEach((rkey, i) => {
		let emits = i == 0 ? WB_EMITS : EMITS
		Object.keys(emits).forEach(symbol => {
			let quote = emits[symbol]
			if (Object.keys(quote).length == 0) return;
			quote.symbol = symbol
			socket.emit(`${rkey}:${symbol}`, quote)
			Object.assign(emits, { [symbol]: {} })
		})
	})
}

function onsave() {
	let coms = []

	Object.keys(WB_SAVES).forEach(symbol => {
		let quote = WB_SAVES[symbol]
		if (Object.keys(quote).length == 0) return;
		coms.push(['hmset', `${rkeys.WB.QUOTES}:${symbol}`, quote as any])
		Object.assign(WB_SAVES, { [symbol]: {} })
	})

	Object.keys(SAVES).forEach(symbol => {
		let quote = SAVES[symbol]
		if (Object.keys(quote).length == 0) return;
		coms.push(['hmset', `${rkeys.QUOTES}:${symbol}`, quote as any])
		Object.assign(SAVES, { [symbol]: {} })
	})

	if (coms.length == 0) return;
	redis.main.coms(coms)

}



emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	let quote = WB_QUOTES[symbol]
	let toquote = {} as Webull.Quote
	if (!quote) return console.warn('WB_QUOTES ondata !quote symbol ->', symbol);
	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)

	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) return;
	// if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
	// 	let deal = webull.toDeal(wbquote)
	// 	quotes.applydeal(QUOTES[symbol], deal, toquote)
	// 	socket.emit(`${rkeys.DEALS}:${symbol}`, deal)
	// 	return
	// }

	Object.keys(wbquote).forEach(k => {
		let source = wbquote[k]
		let target = quote[k]
		if (target == null) { target = source; quote[k] = source; toquote[k] = source }
		let keymap = quotes.KEY_MAP[k]
		if (keymap) {
			if (keymap.time && source > target) {
				toquote[k] = source
			}
			else if (keymap.greater && (source > target || Math.abs(core.calc.percent(source, target)) > 50)) {
				toquote[k] = source
			}
		}
		else if (source != target) {
			toquote[k] = source
		}
	})

	let tokeys = Object.keys(toquote)
	if (tokeys.length == 0) return;

	// let diff = tokeys.reduce((item, key) => { item[key] = from[key]; return item }, {})
	// console.info(symbol, '->', webull.mqtt_topics[topic], diff, toquote)

	core.object.merge(WB_QUOTES[symbol], toquote)
	core.object.merge(WB_EMITS[symbol], toquote)
	core.object.merge(WB_SAVES[symbol], toquote)

})





emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	let quote = QUOTES[symbol]
	let toquote = {} as Quotes.Quote
	if (!quote) return console.warn('QUOTES ondata !quote symbol ->', symbol);
	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)

	let from = core.clone(quote)
	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
		applywbdeal(quote, wbquote, toquote)
	} else {
		applywbquote(quote, wbquote, toquote)
	}

	let tokeys = Object.keys(toquote)
	if (tokeys.length == 0) return;

	// let diff = tokeys.reduce((item, key) => { item[key] = from[key]; return item }, {})
	// console.info(symbol, '->', webull.mqtt_topics[topic], diff, toquote)

	applycalcs(quote, toquote)
	core.object.merge(QUOTES[symbol], toquote)
	core.object.merge(EMITS[symbol], toquote)
	core.object.merge(SAVES[symbol], toquote)

})




