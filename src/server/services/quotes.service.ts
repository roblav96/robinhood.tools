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

const SYMBOLS = [] as string[]
const WB_QUOTES = {} as Dict<Webull.Quote>
const WB_EMITS = {} as Dict<Webull.Quote>
const WB_SAVES = {} as Dict<Webull.Quote>
const QUOTES = {} as Dict<Quotes.Quote>
const EMITS = {} as Dict<Quotes.Quote>
const SAVES = {} as Dict<Quotes.Quote>

pandora.once('symbols.ready', onsymbols)
pandora.broadcast({}, 'symbols.start')
if (process.env.SYMBOLS == 'STOCKS') {
	pandora.on('symbols.reset', onsymbols)
}

async function onsymbols() {

	clock.offListener(ontick)
	CLIENTS.forEach(v => v.destroy())
	core.nullify(CLIENTS)
	core.nullify(SYMBOLS)
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
	if (process.env.DEVELOPMENT && +process.env.SCALE == 1) fsymbols = utils[`DEV_${process.env.SYMBOLS}`];

	SYMBOLS.push(...Object.keys(fsymbols))
	let alls = await quotes.getAlls(SYMBOLS, ['quote', 'wbquote'])
	alls.forEach(all => {
		let symbol = all.symbol

		Object.assign(WB_QUOTES, { [symbol]: all.wbquote })
		Object.assign(WB_EMITS, { [symbol]: {} })
		Object.assign(WB_SAVES, { [symbol]: {} })
		Object.assign(QUOTES, { [symbol]: all.quote })
		Object.assign(EMITS, { [symbol]: {} })
		Object.assign(SAVES, { [symbol]: {} })

		socket.emit(`${rkeys.QUOTES}:${symbol}`, all.quote)

	})

	let chunks = core.array.chunks(_.toPairs(fsymbols), _.ceil(SYMBOLS.length / 256))
	CLIENTS.splice(0, Infinity, ...chunks.map((chunk, i) => new webull.MqttClient({
		fsymbols: _.fromPairs(chunk),
		topics: process.env.SYMBOLS,
		index: i, chunks: chunks.length,
		connect: chunks.length == 1 && i == 0,
		// verbose: true,
	}, emitter)))

	clock.on('1s', ontick)

	pandora.broadcast({}, 'quotes.ready')

}



emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol

	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
		let deal = quotes.todeal(wbquote)
		socket.emit(`${rkeys.DEALS}:${symbol}`, deal)

		let dealquote = quotes.applydeal(QUOTES[symbol], deal)
		if (Object.keys(dealquote).length > 0) {
			dealquote.symbol = symbol
			core.object.merge(QUOTES[symbol], dealquote)
			core.object.merge(EMITS[symbol], dealquote)
			core.object.merge(SAVES[symbol], dealquote)
		}

		return
	}

	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)
	let toquote = {} as Webull.Quote
	let quote = WB_QUOTES[symbol]
	if (!quote) return console.warn(symbol, `!quote ->`, quote, wbquote);

	Object.keys(wbquote).forEach(k => {
		let source = wbquote[k]
		let target = quote[k]
		if (target == null) { target = source; quote[k] = source; toquote[k] = source }
		let keymap = quotes.KEY_MAP[k]
		if (keymap && keymap.time) {
			if (source > target) {
				toquote[k] = source
			}
			return
		}
		if (keymap && keymap.greater) {
			if (source > target || Math.abs(core.calc.percent(source, target)) > 50) {
				toquote[k] = source
			}
			return
		}
		if (source != target) {
			toquote[k] = source
		}
	})

	if (Object.keys(toquote).length > 0) {
		// console.info(symbol, '->', webull.mqtt_topics[topic], '->', wbquote, toquote)
		toquote.symbol = symbol
		core.object.merge(WB_QUOTES[symbol], toquote)
		core.object.merge(WB_EMITS[symbol], toquote)
		core.object.merge(WB_SAVES[symbol], toquote)

		if (topic == webull.mqtt_topics.TICKER_BID_ASK) {
			let baquote = quotes.applybidask(QUOTES[symbol], toquote)
			if (Object.keys(baquote).length > 0) {
				baquote.symbol = symbol
				core.object.merge(QUOTES[symbol], baquote)
				core.object.merge(EMITS[symbol], baquote)
				core.object.merge(SAVES[symbol], baquote)
			}
		}
	}

})



function ontick(i: number) {
	let save = i % 10 == 0

	let coms = [] as Redis.Coms
	SYMBOLS.forEach(symbol => {

		let wbquote = WB_EMITS[symbol]
		let toquote = EMITS[symbol]
		if (Object.keys(wbquote).length > 0) {
			quotes.applywbquote(QUOTES[symbol], wbquote, toquote)
			core.object.merge(WB_QUOTES[symbol], wbquote)
			core.object.merge(WB_SAVES[symbol], wbquote)
			socket.emit(`${rkeys.WB.QUOTES}:${symbol}`, wbquote)
		}
		if (Object.keys(toquote).length > 0) {
			quotes.applycalcs(QUOTES[symbol], toquote)
			core.object.merge(QUOTES[symbol], toquote)
			core.object.merge(SAVES[symbol], toquote)
			socket.emit(`${rkeys.QUOTES}:${symbol}`, toquote)
		}

		if (save) {
			if (Object.keys(WB_SAVES[symbol]).length > 0) {
				coms.push(['hmset', `${rkeys.WB.QUOTES}:${symbol}`, WB_SAVES[symbol] as any])
			}

			let toquote = SAVES[symbol]
			if (Object.keys(toquote).length == 0) return;
			coms.push(['hmset', `${rkeys.QUOTES}:${symbol}`, toquote as any])
			if (!toquote.timestamp) return;

			let quote = QUOTES[symbol]
			quotes.resetquote(quote)

		}

	})

	SYMBOLS.forEach(symbol => {
		Object.assign(WB_EMITS, { [symbol]: {} })
		Object.assign(EMITS, { [symbol]: {} })
		if (save) {
			Object.assign(WB_SAVES, { [symbol]: {} })
			Object.assign(SAVES, { [symbol]: {} })
		}
	})

	redis.main.coms(coms)

}


