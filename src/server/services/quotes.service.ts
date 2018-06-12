// 

import '../main'
import * as schedule from 'node-schedule'
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



declare global { namespace NodeJS { interface ProcessEnv { SYMBOLS: TypeOfSymbols } } }
const emitter = new Emitter<'data'>()
const MQTTS = [] as WebullMqttClient[]

const SYMBOLS = [] as string[]
const WB = {
	QUOTES: {} as Dict<Webull.Quote>,
	SAVES: {} as Dict<Webull.Quote>,
	EMITS: {} as Dict<Webull.Quote>,
}
const QUOTES = {
	CALCS: {} as Dict<Quotes.Calc>,
	LIVES: {} as Dict<Quotes.Calc>,
	EMITS: {} as Dict<Quotes.Calc>,
}



radio.on('symbols.pause', destroy)
radio.on('symbols.resume', start)
radio.once('symbols.start', start)
radio.emit('symbols.ready')

function destroy() {
	clock.offListener(ontick)
	MQTTS.forEach(v => v.destroy())
	core.nullify(MQTTS)
	core.nullify(SYMBOLS)
	core.nullify(WB)
	core.nullify(QUOTES)
}

async function start() {
	destroy()

	let fsymbols = (process.env.SYMBOLS == 'STOCKS' ?
		await utils.getInstanceFullSymbols(process.env.SYMBOLS) :
		await utils.getFullSymbols(process.env.SYMBOLS)
	)

	// if (process.env.DEVELOPMENT) return;
	if (process.env.DEVELOPMENT && +process.env.SCALE == 1) fsymbols = utils[`DEV_${process.env.SYMBOLS}`];
	SYMBOLS.push(...Object.keys(fsymbols))

	let alls = await quotes.getAlls(SYMBOLS, ['quote', 'wbquote'])
	alls.forEach(({ symbol, quote, wbquote }) => {

		socket.emit(`${rkeys.WB.QUOTES}:${symbol}`, wbquote)
		Object.assign(WB.QUOTES, { [symbol]: core.clone(wbquote) })
		Object.assign(WB.SAVES, { [symbol]: {} })
		Object.assign(WB.EMITS, { [symbol]: {} })

		socket.emit(`${rkeys.QUOTES}:${symbol}`, quote)
		quotes.convert(quote, quotes.ALL_CALC_KEYS)
		Object.assign(QUOTES.CALCS, { [symbol]: core.clone(quote) })
		Object.assign(QUOTES.LIVES, { [symbol]: core.clone(quote) })
		Object.assign(QUOTES.EMITS, { [symbol]: core.clone(quote) })

	})

	let chunks = core.array.chunks(_.toPairs(fsymbols), _.ceil(SYMBOLS.length / 256))
	MQTTS.splice(0, Infinity, ...chunks.map((chunk, i) => new WebullMqttClient({
		fsymbols: _.fromPairs(chunk),
		topics: process.env.SYMBOLS,
		verbose: true,
	}, emitter)))

	clock.on('1s', ontick)

}



emitter.on('data', function ondata(topic: number, wbdata: Webull.Quote) {
	let symbol = wbdata.symbol
	if (!symbol) return console.warn(symbol, webull.mqtt_topics[topic], `!symbol ->\nwbdata ->`, wbdata);

	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
		let deal = quotes.toDeal(wbdata)
		socket.emit(`${rkeys.DEALS}:${symbol}`, deal)
		let quote = QUOTES.CALCS[symbol]
		quotes.mergeCalcs(quote, quotes.applyDeal(quote, deal))
		return
	}

	if (topic == webull.mqtt_topics.TICKER_BID_ASK) {
		let quote = QUOTES.CALCS[symbol]
		quotes.mergeCalcs(quote, quotes.applyWbQuote(quote, wbdata))
	}

	// console.log(symbol, webull.mqtt_topics[topic], '->\nwbdata ->', wbdata)
	let towbquote = {} as Webull.Quote
	let wbquote = WB.QUOTES[symbol]
	if (!wbquote) return console.warn(symbol, webull.mqtt_topics[topic], `!wbquote ->\nwbdata ->`, wbdata);

	Object.keys(wbdata).forEach(key => {
		let to = wbdata[key]
		let from = wbquote[key]
		if (from == null) { from = to; wbquote[key] = to; towbquote[key] = to }
		let keymap = quotes.KEY_MAP[key]
		quotes.applyKeyMap(keymap, towbquote, key, to, from)
	})

	let tokeys = Object.keys(towbquote)
	if (tokeys.length > 0) {
		// console.info(symbol, webull.mqtt_topics[topic], '->\ntowbquote ->', towbquote)
		core.object.mergeAll([WB.QUOTES[symbol], WB.EMITS[symbol]], towbquote, tokeys)
	}
})



function ontick() {
	let t = Date.now()
	let coms = [] as Redis.Coms
	let live = new Date().getSeconds() % 10 == core.math.dispersed(10, +process.env.INSTANCE, +process.env.SCALE)

	SYMBOLS.forEach(symbol => {
		let quote = QUOTES.CALCS[symbol]

		let towbquote = WB.EMITS[symbol]
		if (Object.keys(towbquote).length > 0) {
			core.object.merge(WB.SAVES[symbol], towbquote)
			quotes.mergeCalcs(quote, quotes.applyWbQuote(quote, towbquote))
			towbquote.symbol = symbol
			socket.emit(`${rkeys.WB.QUOTES}:${symbol}`, towbquote)
			Object.assign(WB.EMITS, { [symbol]: {} })
		}

		let ediff = core.object.difference(QUOTES.EMITS[symbol], quote)

		if (live) {
			let wbsaves = WB.SAVES[symbol]
			if (Object.keys(wbsaves).length > 0) {
				coms.push(['hmset', `${rkeys.WB.QUOTES}:${symbol}`, wbsaves as any])
				Object.assign(WB.SAVES, { [symbol]: {} })
			}

			let flquote = QUOTES.LIVES[symbol]
			let ldiff = core.object.difference(flquote, quote)
			if (quote.timestamp > flquote.timestamp) {
				quote.liveCount++
				quote.liveStamp = Date.now()

				let lkey = `${rkeys.LIVES}:${symbol}:${quote.timestamp}`
				let lquote = quotes.getConverted(quote, quotes.ALL_LIVE_KEYS)
				coms.push(['hmset', lkey, lquote as any])
				let zkey = `${rkeys.LIVES}:${symbol}`
				coms.push(['zadd', zkey, quote.timestamp as any, lkey])
				lquote.symbol = symbol
				socket.emit(`${rkeys.LIVES}:${symbol}`, lquote)

				core.object.merge(quote, quotes.resetLive(quote))

				ldiff = core.object.difference(flquote, quote)
				core.object.merge(ediff, ldiff)

				core.object.merge(flquote, quote)
			}

			if (Object.keys(ldiff).length > 0) {
				coms.push(['hmset', `${rkeys.QUOTES}:${symbol}`, ldiff as any])
			}
		}

		if (Object.keys(ediff).length > 0) {
			ediff.symbol = symbol
			socket.emit(`${rkeys.QUOTES}:${symbol}`, ediff)
			Object.assign(QUOTES.EMITS, { [symbol]: core.clone(quote) })
		}
	})

	if (process.env.PRODUCTION) {
		redis.main.coms(coms).then(function() {
			let tdiff = Date.now() - t
			let key = live ? 'lives' : 'emits'
			avgs[key] = avgs[key] ? core.math.round(_.mean([avgs[key], tdiff]), 2) : tdiff
			console.log(`avgs ->`, avgs)
		})
	}

}

const avgs = {
	emits: 0,
	lives: 0,
}





// const QUOTE = {
// 	timestamp: 1528810411000,
// 	openPrice: 61.82,
// 	prevClose: 61.39,
// 	closePrice: 61.31,
// 	vibrateRatio: 0.0098,
// 	volume: 1909163,
// 	dealCount: 125099,
// 	turnoverRate: 0.0017,
// 	sharesOutstanding: 1159764549,
// 	sharesFloat: 1108482925,
// 	yearHigh: 64.66,
// 	yearLow: 26.85,
// 	ask: 61.27,
// 	bid: 61.26,
// 	status: 'OPENING',
// 	bids: 200,
// 	asks: 200,
// 	price: 61.31,
// 	size: 0,
// 	bidSpread: 61.26,
// 	askSpread: 61.27,
// 	bidSize: 200,
// 	bidVolume: 200,
// 	askSize: 200,
// 	askVolume: 200,
// 	statusTimestamp: 1528810420373,
// 	startPrice: 61.31,
// 	close: 61.31,
// 	change: 0,
// 	percent: 0,
// 	prePrice: 61.31,
// 	preChange: 0,
// 	prePercent: 0,
// 	regPrice: 61.31,
// 	regChange: -0.51,
// 	regPercent: -0.82497574,
// 	postPrice: 61.31,
// 	postChange: 0,
// 	postPercent: 0,
// 	marketCap: 71105164499,
// 	regTimestamp: 1528810411000,
// 	spread: 0.01,
// 	baFlowSize: 0,
// 	baFlowVolume: 0
// }

// import * as benchmark from '../../common/benchmark'
// benchmark.simple('sum', [
// 	function objectkeys1() {
// 		Object.keys(QUOTE).forEach(key => {

// 		})
// 	},
// 	function objectkeys2() {
// 		let keys = Object.keys(QUOTE)
// 		keys.forEach(key => {

// 		})
// 	},
// 	function objectkeys3() {
// 		let keys = Object.keys(QUOTE)
// 		let i: number, len = keys.length
// 		for (i = 0; i < len; i++) {
// 			let key = keys[i]
// 		}
// 	},
// ])



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



// import * as benchmark from '../../common/benchmark'
// let state = 'PREPRE' as Hours.State
// benchmark.simple('indexof', [
// 	function indexof() {
// 		state.indexOf('PRE')
// 	},
// 	function indexof() {
// 		state.includes('PRE')
// 	},
// 	function datenow() {
// 		Date.now()
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


