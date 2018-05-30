// 

import '../main'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pretty from '../../common/pretty'
import * as utils from '../adapters/utils'
import * as redis from '../adapters/redis'
import * as socket from '../adapters/socket'
import * as webull from '../adapters/webull'
import * as quotes from '../adapters/quotes'
import WebullMqttClient from '../adapters/webull.mqtt'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'
import radio from '../adapters/radio'



const emitter = new Emitter<'data'>()
const MQTTS = [] as WebullMqttClient[]
const SYMBOLS = [] as string[]

const WB_QUOTES = {} as Dict<Webull.Quote>
const WB_EMITS = {} as Dict<Webull.Quote>
const WB_SAVES = {} as Dict<Webull.Quote>

const QUOTES = {} as Dict<Quotes.Quote>
const EMITS = {} as Dict<Quotes.Quote>
const SAVES = {} as Dict<Quotes.Quote>

radio.once('symbols.ready', onsymbols)
radio.emit('symbols.start')
if (process.env.SYMBOLS == 'STOCKS') {
	radio.on('symbols.reset', onsymbols)
}
declare global { namespace NodeJS { interface ProcessEnv { SYMBOLS: TypeofSymbols } } }

async function onsymbols(event: Radio.Event) {

	clock.offListener(ontick)
	MQTTS.remove(v => !!v.destroy())
	core.nullify(SYMBOLS)
	core.nullify(WB_QUOTES); core.nullify(WB_EMITS); core.nullify(WB_SAVES);
	core.nullify(QUOTES); core.nullify(EMITS); core.nullify(SAVES);

	let fsymbols = (process.env.SYMBOLS == 'STOCKS' ?
		await utils.getInstanceFullSymbols(process.env.SYMBOLS) :
		await utils.getFullSymbols(process.env.SYMBOLS)
	)

	// if (process.env.DEVELOPMENT) return;
	if (process.env.DEVELOPMENT && +process.env.SCALE == 1) fsymbols = utils[`DEV_${process.env.SYMBOLS}`];
	SYMBOLS.push(...Object.keys(fsymbols))

	let coms = [] as Redis.Coms
	let alls = await quotes.getAlls(SYMBOLS, ['quote', 'wbquote'])
	alls.forEach(({ symbol, quote, wbquote }) => {

		if (!quote.typeof) {
			quote.typeof = process.env.SYMBOLS
			coms.push(['hset', `${rkeys.QUOTES}:${symbol}`, 'typeof', quote.typeof])
		}

		quotes.conform({ quote, qkeys: quotes.CALC_KEYS_ALL, mutate: true })

		Object.assign(WB_QUOTES, { [symbol]: wbquote })
		Object.assign(WB_EMITS, { [symbol]: {} })
		Object.assign(WB_SAVES, { [symbol]: {} })
		Object.assign(QUOTES, { [symbol]: quote })
		Object.assign(EMITS, { [symbol]: {} })
		Object.assign(SAVES, { [symbol]: {} })

		socket.emit(`${rkeys.QUOTES}:${symbol}`, quote)
	})

	if (coms.length > 0) await redis.main.coms(coms);

	let chunks = core.array.chunks(_.toPairs(fsymbols), _.ceil(SYMBOLS.length / 256))
	MQTTS.splice(0, Infinity, ...chunks.map((chunk, i) => new WebullMqttClient({
		fsymbols: _.fromPairs(chunk),
		topics: process.env.SYMBOLS,
		verbose: true,
	}, emitter)))

	clock.on('1s', ontick)

	if (event.name == 'symbols.reset') {
		radio.emit('quotes.ready')
	}

}



emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	if (!symbol) return console.warn(`!symbol ->`, webull.mqtt_topics[topic], wbquote);

	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
		let deal = quotes.todeal(wbquote)
		socket.emit(`${rkeys.DEALS}:${symbol}`, deal)

		let toquote = quotes.applydeal(QUOTES[symbol], deal)
		if (Object.keys(toquote).length > 0) {
			core.object.mergeAll([QUOTES[symbol], EMITS[symbol]], toquote)
		}

		return
	}

	// console.log(symbol, '->', webull.mqtt_topics[topic], '->', wbquote)
	let toquote = {} as Webull.Quote
	let quote = WB_QUOTES[symbol]
	if (!quote) return console.warn(`!quote ->`, symbol, webull.mqtt_topics[topic], wbquote);

	Object.keys(wbquote).forEach(k => {
		let source = wbquote[k]
		let target = quote[k]
		if (target == null) { target = source; quote[k] = source; toquote[k] = source }
		let keymap = quotes.KEY_MAP[k]
		if (keymap && (keymap.time || keymap.greater)) {
			if (source > target) {
				toquote[k] = source
			}
		}
		else if (source != target) {
			toquote[k] = source
		}
	})

	if (Object.keys(toquote).length > 0) {
		// console.info(symbol, '->', webull.mqtt_topics[topic], '\nwbquote ->', wbquote, '\ntoquote ->', toquote)
		core.object.mergeAll([WB_QUOTES[symbol], WB_EMITS[symbol]], toquote)

		if (topic == webull.mqtt_topics.TICKER_BID_ASK) {
			let baquote = quotes.applybidask(QUOTES[symbol], toquote)
			if (Object.keys(baquote).length > 0) {
				core.object.mergeAll([QUOTES[symbol], EMITS[symbol]], baquote)
			}
		}
	}

})



function ontick(i: number) {
	let save = i % 10 == 0

	let coms = [] as Redis.Coms
	SYMBOLS.forEach(symbol => {

		// let wbquote = 

		// let wbquote = core.object.difference(WB_EMITS[symbol], WB_QUOTES[symbol])
		// let toquote = core.object.difference(EMITS[symbol], QUOTES[symbol])
		// if (Object.keys(wbquote).length > 0) {
		// 	quotes.applywbquote(QUOTES[symbol], wbquote, toquote)
		// 	wbquote.symbol = symbol
		// 	socket.emit(`${rkeys.WB.QUOTES}:${symbol}`, wbquote)
		// }
		// if (Object.keys(toquote).length > 0) {
		// 	quotes.applycalcs(QUOTES[symbol], toquote)
		// 	core.object.merge(QUOTES[symbol], toquote)
		// 	toquote.symbol = symbol
		// 	socket.emit(`${rkeys.QUOTES}:${symbol}`, toquote)
		// }

		return

		if (save) {
			let wbquote = core.object.difference(WB_SAVE_QUOTES[symbol], WB_QUOTES[symbol])
			if (Object.keys(wbquote).length > 0) {
				coms.push(['hmset', `${rkeys.WB.QUOTES}:${symbol}`, wbquote as any])
			}

			let toquote = QUOTES[symbol]
			let savequote = SAVE_QUOTES[symbol]
			let diffquote = core.object.difference(savequote, toquote)
			if (Object.keys(diffquote).length == 0) return;

			coms.push(['hmset', `${rkeys.QUOTES}:${symbol}`, diffquote as any])
			if (toquote.timestamp <= savequote.timestamp) return;

			let stamp = Date.now()
			toquote.liveStamp = stamp
			toquote.liveCount++

			quotes.conform(toquote, quotes.LIVE_KEYS_ALL)

			let zkey = `${rkeys.LIVES}:${symbol}`
			let lkey = `${zkey}:${stamp}`
			coms.push(['hmset', lkey, toquote as any])
			coms.push(['zadd', zkey, stamp as any, lkey])

			core.object.merge(QUOTES[symbol], quotes.resetlive(toquote))

		}

	})

	SYMBOLS.forEach(symbol => {
		Object.assign(WB_EMITS, { [symbol]: {} })
		Object.assign(EMITS, { [symbol]: {} })
		if (save) {
			Object.assign(WB_SAVES, { [symbol]: {} })
			Object.assign(SAVES, { [symbol]: {} })
		}
		// core.object.merge(WB_EMITS[symbol], WB_QUOTES[symbol])
		// core.object.merge(EMITS[symbol], QUOTES[symbol])
		// if (save) {
		// 	core.object.merge(WB_SAVES[symbol], WB_QUOTES[symbol])
		// 	core.object.merge(SAVES[symbol], QUOTES[symbol])
		// }
	})

	if (coms.length > 0) {
		// console.log('coms ->', coms)
		redis.main.coms(coms)
	}

}





// if (mergeIfAll([WB_QUOTES[symbol], WB_EMITS[symbol]], toquote)) {

// }
// function mergeIfAll<T = any>(quotes: T[], toquote: T) {
// 	let keys = Object.keys(toquote)
// 	if (keys.length == 0) return false;
// 	let size = quotes.length
// 	let i: number, len = keys.length
// 	for (i = 0; i < len; i++) {
// 		let key = keys[i]
// 		let value = toquote[key]
// 		if (value != null) {
// 			let ii: number, lenn = size
// 			for (ii = 0; ii < lenn; ii++) {
// 				quotes[ii][key] = value
// 			}
// 		}
// 	}
// 	return true
// }


