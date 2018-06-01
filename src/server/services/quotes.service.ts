// 

import '../main'
import * as _ from '../../common/lodash'
import * as Rx from '../../common/rxjs'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pretty from '../../common/pretty'
import * as utils from '../adapters/utils'
import * as redis from '../adapters/redis'
import * as socket from '../adapters/socket'
import * as webull from '../adapters/webull'
import * as quotes from '../adapters/quotes'
import * as hours from '../adapters/hours'
import WebullMqttClient from '../adapters/webull.mqtt'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'
import radio from '../adapters/radio'



declare global { namespace NodeJS { interface ProcessEnv { SYMBOLS: TypeofSymbols } } }
const emitter = new Emitter<'data'>()
const MQTTS = [] as WebullMqttClient[]
const SYMBOLS = [] as string[]

const WB_QUOTES = {} as Dict<Webull.Quote>
const WB_SAVES = {} as Dict<Webull.Quote>
const WB_EMITS = {} as Dict<Webull.Quote>

const QUOTES = {} as Dict<Quotes.Calc>
const LIVES = {} as Dict<Quotes.Calc>
const EMITS = {} as Dict<Quotes.Calc>

radio.once('symbols.start', start)
radio.emit('symbols.ready')

Rx.subscription(hours.rxstate).subscribe(state => {
	let states = ['PREPRE', 'CLOSED'] as Hours.State[]
	if (states.includes(state)) start();
})

async function start() {

	clock.offListener(ontick)
	MQTTS.remove(v => { v.destroy(); return true })
	core.nullify(SYMBOLS)
	core.nullify(WB_QUOTES); core.nullify(WB_SAVES); core.nullify(WB_EMITS);
	core.nullify(QUOTES); core.nullify(LIVES); core.nullify(EMITS);

	if (hours.rxstate.value == 'CLOSED') {
		if (process.env.PRODUCTION) return;
	}

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

		Object.assign(WB_QUOTES, { [symbol]: core.clone(wbquote) })
		Object.assign(WB_SAVES, { [symbol]: {} })
		Object.assign(WB_EMITS, { [symbol]: {} })

		quotes.convert(quote, quotes.ALL_CALC_KEYS)
		Object.assign(QUOTES, { [symbol]: core.clone(quote) })
		Object.assign(LIVES, { [symbol]: core.clone(quote) })
		Object.assign(EMITS, { [symbol]: {} })

		socket.emit(`${rkeys.QUOTES}:${symbol}`, quote)

	})

	await redis.main.coms(coms)

	let chunks = core.array.chunks(_.toPairs(fsymbols), _.ceil(SYMBOLS.length / 256))
	MQTTS.splice(0, Infinity, ...chunks.map((chunk, i) => new WebullMqttClient({
		fsymbols: _.fromPairs(chunk),
		topics: process.env.SYMBOLS,
		verbose: true,
	}, emitter)))

	clock.on('1s', ontick)

}



emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	if (!symbol) return console.warn(`!symbol ->`, webull.mqtt_topics[topic], wbquote);

	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
		let deal = quotes.todeal(wbquote)
		socket.emit(`${rkeys.DEALS}:${symbol}`, deal)
		let toquote = quotes.applydeal(QUOTES[symbol], deal)
		core.object.mergeAll([QUOTES[symbol], EMITS[symbol]], toquote)
		return
	}

	// console.log(symbol, webull.mqtt_topics[topic], '->\nwbquote ->', wbquote)
	let towbquote = {} as Webull.Quote
	let quote = WB_QUOTES[symbol]
	if (!quote) return console.warn(symbol, webull.mqtt_topics[topic], `!quote ->\nwbquote ->`, wbquote);

	Object.keys(wbquote).forEach(k => {
		let to = wbquote[k]
		let from = quote[k]
		if (from == null) { from = to; quote[k] = to; towbquote[k] = to }
		let keymap = quotes.KEY_MAP[k]
		if (keymap && (keymap.time || keymap.greater)) {
			if (keymap.time) {
				if (to > from) towbquote[k] = to;
			} else if (keymap.greater) {
				if (to < from) {
					if (core.calc.percent(to, from) < -50) towbquote[k] = to;
				} else if (to > from) towbquote[k] = to;
			}
		} else if (to != from) {
			towbquote[k] = to
		}
	})

	let tokeys = Object.keys(towbquote)
	if (tokeys.length > 0) {
		// console.info(symbol, webull.mqtt_topics[topic], '->\ntowbquote ->', towbquote)
		core.object.mergeAll([WB_QUOTES[symbol], WB_EMITS[symbol]], towbquote, tokeys)

		if (topic == webull.mqtt_topics.TICKER_BID_ASK) {
			let toquote = quotes.applybidask(QUOTES[symbol], towbquote)
			core.object.mergeAll([QUOTES[symbol], EMITS[symbol]], toquote)
		}
	}
})



function ontick(i: number) {
	let live = i % 10 == 0

	let coms = [] as Redis.Coms
	SYMBOLS.forEach(symbol => {

		let quote = QUOTES[symbol]
		let toquote = EMITS[symbol]
		let wbquote = WB_EMITS[symbol]

		if (Object.keys(wbquote).length > 0) {
			core.object.merge(WB_SAVES[symbol], wbquote)
			quotes.applywbquote(quote, wbquote, toquote)
			core.object.merge(quote, toquote)
			wbquote.symbol = symbol
			socket.emit(`${rkeys.WB.QUOTES}:${symbol}`, wbquote)
			Object.assign(WB_EMITS, { [symbol]: {} })
		}

		if (Object.keys(toquote).length > 0) {
			quotes.applycalcs(quote, toquote)
			core.object.merge(quote, toquote)
			toquote.symbol = symbol
			socket.emit(`${rkeys.QUOTES}:${symbol}`, toquote)
			Object.assign(EMITS, { [symbol]: {} })
		}

		if (live) {
			let wbsaves = WB_SAVES[symbol]
			if (Object.keys(wbsaves).length > 0) {
				coms.push(['hmset', `${rkeys.WB.QUOTES}:${symbol}`, wbsaves as any])
				Object.assign(WB_SAVES, { [symbol]: {} })
			}

			let fquote = LIVES[symbol]
			let diff = core.object.difference(fquote, quote)
			if (Object.keys(diff).length > 0) {
				if (diff.timestamp && quote.timestamp > fquote.timestamp) {

					quote.liveCount++
					quote.liveStamp = Date.now()

					let lkey = `${rkeys.LIVES}:${symbol}:${quote.timestamp}`
					let lquote = quotes.getConverted(quote, quotes.ALL_LIVE_KEYS)
					coms.push(['hmset', lkey, lquote as any])
					core.object.merge(diff, lquote)

					let zkey = `${rkeys.LIVES}:${symbol}`
					coms.push(['zadd', zkey, quote.timestamp as any, lkey])

					socket.emit(`${rkeys.LIVES}:${symbol}`, lquote)

					core.object.merge(quote, quotes.resetlive(quote))
					core.object.merge(LIVES[symbol], quote)

				}
				coms.push(['hmset', `${rkeys.QUOTES}:${symbol}`, diff as any])
			}
		}

	})

	redis.main.coms(coms)

}





// import * as benchmark from '../../common/benchmark'
// benchmark.simple('math', [
// 	function mathmin() {
// 		Math.min(1, 2, 3, 4, 5)
// 	},
// 	function _min() {
// 		_.min([1, 2, 3, 4, 5])
// 	},
// 	function mathmax() {
// 		Math.max(1, 2, 3, 4, 5)
// 	},
// 	function _max() {
// 		_.max([1, 2, 3, 4, 5])
// 	},
// ])



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


