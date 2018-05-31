// 

import '../main'
import * as Rx from '../../common/rxjs'
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
const QUOTES = {} as Dict<Quotes.Quote>

const WB_EMITS = {} as Dict<string[]>
const EMITS = {} as Dict<string[]>
const WB_SAVES = {} as Dict<string[]>
const SAVES = {} as Dict<string[]>
function pushkeys(keys: string[], tokeys: string[]) {
	tokeys.forEach(k => { if (keys.indexOf(k) == -1) keys.push(k); })
}

radio.once('symbols.ready', onsymbols)
radio.emit('symbols.start')
if (process.env.SYMBOLS == 'STOCKS') {
	radio.on('symbols.reset', onsymbols)
}
declare global { namespace NodeJS { interface ProcessEnv { SYMBOLS: TypeofSymbols } } }

async function onsymbols(event: Radio.Event) {

	clock.offListener(ontick)
	MQTTS.forEach(v => v.destroy())
	MQTTS.splice(0)
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

		Object.assign(WB_QUOTES, { [symbol]: wbquote })
		Object.assign(WB_EMITS, { [symbol]: [] })
		Object.assign(WB_SAVES, { [symbol]: [] })

		quotes.toConform(quote, quotes.CALC_KEYS_ALL)
		Object.assign(QUOTES, { [symbol]: quote })
		Object.assign(EMITS, { [symbol]: [] })
		Object.assign(SAVES, { [symbol]: [] })

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
		let tokeys = Object.keys(toquote)
		if (tokeys.length > 0) {
			pushkeys(EMITS[symbol], tokeys)
			core.object.merge(QUOTES[symbol], toquote, tokeys)
		}

		return
	}

	// console.log(symbol, webull.mqtt_topics[topic], '->\nwbquote ->', wbquote)
	let towbquote = {} as Webull.Quote
	let quote = WB_QUOTES[symbol]
	if (!quote) return console.warn(symbol, webull.mqtt_topics[topic], `!quote ->\nwbquote ->`, wbquote);

	Object.keys(wbquote).forEach(k => {
		let source = wbquote[k]
		let target = quote[k]
		if (target == null) { target = source; quote[k] = source; towbquote[k] = source }
		let keymap = quotes.KEY_MAP[k]
		if (keymap && (keymap.time || keymap.greater)) {
			if (source > target) {
				towbquote[k] = source
			}
		} else if (source != target) {
			towbquote[k] = source
		}
	})

	let wbkeys = Object.keys(towbquote)
	if (wbkeys.length > 0) {
		// console.info(symbol, webull.mqtt_topics[topic], '->\nwbquote ->', wbquote, '\ntoquote ->', towbquote)
		// console.info(symbol, webull.mqtt_topics[topic], '->\ntoquote ->', towbquote)
		pushkeys(WB_EMITS[symbol], wbkeys)
		core.object.merge(WB_QUOTES[symbol], towbquote, wbkeys)

		// console.log(symbol, webull.mqtt_topics[topic], '->\nwbquote ->', wbquote, '\ntoquote ->', towbquote)
		if (topic == webull.mqtt_topics.TICKER_BID_ASK) {
			// console.info(symbol, webull.mqtt_topics[topic], '->\nwbquote ->', wbquote, '\ntoquote ->', towbquote)
			let toquote = quotes.applybidask(QUOTES[symbol], towbquote)
			let tokeys = Object.keys(toquote)
			if (tokeys.length > 0) {
				// console.warn(symbol, webull.mqtt_topics[topic], '->\nwbquote ->', wbquote, '\ntoquote ->', towbquote)
				pushkeys(EMITS[symbol], tokeys)
				core.object.merge(QUOTES[symbol], toquote, tokeys)
			}
		}
	}

})



function updatedquote<T>(keys: string[], quote: T) {
	let toquote = {} as T
	if (keys.length == 0) return toquote;
	keys.forEach(k => toquote[k] = quote[k])
	return toquote
}

function ontick(i: number) {
	let save = i % 10 == 0

	let coms = [] as Redis.Coms
	SYMBOLS.forEach(symbol => {

		let wbquote = WB_QUOTES[symbol]
		let wbemits = WB_EMITS[symbol]
		let wbsaves = WB_SAVES[symbol]
		let towbquote = updatedquote(wbemits, wbquote)

		let quote = QUOTES[symbol]
		let emits = EMITS[symbol]
		let saves = SAVES[symbol]
		let toquote = updatedquote(emits, quote)

		if (wbemits.length > 0) {
			pushkeys(wbsaves, wbemits.splice(0))
			quotes.applywbquote(quote, towbquote, toquote)
			core.object.merge(quote, toquote)
			towbquote.symbol = symbol
			socket.emit(`${rkeys.WB.QUOTES}:${symbol}`, towbquote)
		}

		if (emits.length > 0) {
			pushkeys(saves, emits.splice(0))
			quotes.applycalcs(quote, toquote)
			core.object.merge(quote, toquote)
			toquote.symbol = symbol
			socket.emit(`${rkeys.QUOTES}:${symbol}`, toquote)
		}

		// console.log(`toquote ->`, toquote)

		if (save) {

			// console.log(`saves ->`, saves)

			if (wbsaves.length > 0) {
				let wbsavequote = updatedquote(wbsaves, wbquote)
				coms.push(['hmset', `${rkeys.WB.QUOTES}:${symbol}`, wbsavequote as any])
				wbsaves.splice(0)
			}
			if (saves.length == 0) return;

			let savequote = updatedquote(saves, quote)
			// console.log('savequote ->', savequote)
			coms.push(['hmset', `${rkeys.QUOTES}:${symbol}`, savequote as any])
			saves.splice(0)
			if (!Number.isFinite(savequote.timestamp)) return;

			// let stamp = Date.now()
			// quote.liveStamp = stamp
			quote.liveCount++



			let conformed = quotes.getConformed(quote, quotes.LIVE_KEYS_ALL)
			let zkey = `${rkeys.LIVES}:${symbol}`
			let lkey = `${zkey}:${savequote.timestamp}`
			coms.push(['hmset', lkey, conformed as any])
			coms.push(['zadd', zkey, savequote.timestamp as any, lkey])

			core.object.merge(quote, quotes.resetlive(quote))

		}

	})

	// SYMBOLS.forEach(symbol => {
	// 	WB_EMITS[symbol].splice(0)
	// 	EMITS[symbol].splice(0)
	// 	if (save) {
	// 		WB_SAVES[symbol].splice(0)
	// 		SAVES[symbol].splice(0)
	// 	}
	// 	// core.object.merge(WB_EMITS[symbol], WB_QUOTES[symbol])
	// 	// core.object.merge(EMITS[symbol], QUOTES[symbol])
	// 	// if (save) {
	// 	// 	core.object.merge(WB_SAVES[symbol], WB_QUOTES[symbol])
	// 	// 	core.object.merge(SAVES[symbol], QUOTES[symbol])
	// 	// }
	// })

	if (coms.length > 0) {
		// console.log('coms ->', coms)
		redis.main.coms(coms)
	}

}











// const rxBuffer = new Rx.Subject<LiveQuote>()
// const rxSub = rxBuffer
// 	.buffer(Rx.Observable.fromEvent(process.ee3_private, shared.RKEY.SYS.TICK_1))
// 	.filter(v => v.length > 0)
// 	.map(lquotes => shared.rxMergeBuffer(lquotes, 'nano', 'symbol', true))
// 	.subscribe(onLiveQuotes)

// function onLiveQuotes(lquotes: Array<LiveQuote>) {
// 	let coms = lquotes.map(function(lquote) {
// 		let rkey = shared.RKEY.CALCS + ':' + lquote.symbol
// 		return ['hmset', rkey, utils.tohset(lquote)]
// 	}) as RedisComs

// 	if (process.DEVELOPMENT) coms.splice(0);

// 	redis.pipelinecoms(coms).then(function(resolved) {
// 		utils.pipelineErrors(resolved)
// 	}).catch(function(error) {
// 		logger.error('onLiveQuotes > error', utils.peRender(error))
// 	})
// }


















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


