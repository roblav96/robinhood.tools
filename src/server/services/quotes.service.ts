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

declare global { namespace NodeJS { interface ProcessEnv { SYMBOLS: TypeOfSymbols } } }
if (process.env.SYMBOLS == 'STOCKS') {
	Rx.subscription(hours.rxstate).subscribe(state => {
		if (state == 'PREPRE') start();
	})
}

radio.once('symbols.start', start)
radio.emit('symbols.ready')

async function start() {

	clock.offListener(ontick)
	MQTTS.remove(v => v.destroy() || true)
	core.nullify(SYMBOLS)
	core.nullify(WB)
	core.nullify(QUOTES)

	// if (hours.rxstate.value == 'CLOSED') {
	// 	if (process.env.PRODUCTION) return;
	// }

	let fsymbols = (process.env.SYMBOLS == 'STOCKS' ?
		await utils.getInstanceFullSymbols(process.env.SYMBOLS) :
		await utils.getFullSymbols(process.env.SYMBOLS)
	)

	// if (process.env.DEVELOPMENT) return;
	if (process.env.DEVELOPMENT && +process.env.SCALE == 1) fsymbols = utils[`DEV_${process.env.SYMBOLS}`];
	SYMBOLS.push(...Object.keys(fsymbols))

	let alls = await quotes.getAlls(SYMBOLS, ['quote', 'wbquote'])
	alls.forEach(({ symbol, quote, wbquote }) => {

		let toquote = quotes.resetFull(quote)
		quotes.mergeCalcs(toquote)
		core.object.repair(quote, toquote)

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

		if (topic == webull.mqtt_topics.TICKER_BID_ASK) {
			let quote = QUOTES.CALCS[symbol]
			quotes.mergeCalcs(quote, quotes.applyWbQuote(quote, towbquote))
		}
	}
})



function ontick(i: number) {
	let t = Date.now()
	let live = new Date().getSeconds() % 10 == core.math.dispersed(10, +process.env.INSTANCE, +process.env.SCALE)

	let coms = [] as Redis.Coms
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
		if (Object.keys(ediff).length > 0) {
			ediff.symbol = symbol
			socket.emit(`${rkeys.QUOTES}:${symbol}`, ediff)
			Object.assign(QUOTES.EMITS, { [symbol]: core.clone(quote) })
		}

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
				socket.emit(`${rkeys.LIVES}:${symbol}`, lquote)

				core.object.merge(quote, quotes.resetLive(quote))

				ldiff = core.object.difference(flquote, quote)
				socket.emit(`${rkeys.QUOTES}:${symbol}`, ldiff)

				core.object.merge(flquote, quote)
			}

			if (Object.keys(ldiff).length > 0) {
				coms.push(['hmset', `${rkeys.QUOTES}:${symbol}`, ldiff as any])
			}
		}
	})

	if (process.env.PRODUCTION) {
		redis.main.coms(coms)
	}

	// let tdiff = Date.now() - t
	// let key = live ? 'lives' : 'emits'
	// avgs[key] = avgs[key] ? _.round(_.mean([avgs[key], tdiff]), 2) : tdiff
	// console.log(`avgs ->`, avgs)

}

const avgs = {
	emits: 0,
	lives: 0,
}







// const mock = {
// 	"bidSpread": 58.74,
// 	"close": 58.88,
// 	"avgVolume": 73876134,
// 	"tinyName": "Micron Technology",
// 	"acronym": "NASDAQ",
// 	"sharesOutstanding": 1159764549,
// 	"price": 58.88,
// 	"yearLow": 26.85,
// 	"issueType": "Common Stock",
// 	"size": 960,
// 	"bid": 58.84,
// 	"tradeTime": 1527878148000,
// 	"alive": true,
// 	"industry": "Semiconductors",
// 	"exchange": "Nasdaq Global Select",
// 	"fullName": "Micron Technology, Inc. Common Stock",
// 	"yearHigh": 64.66,
// 	"bidLot": 500,
// 	"dealFlowVolume": -33426,
// 	"currency": "USD",
// 	"liveCount": 833,
// 	"postTimestamp": 1527897589000,
// 	"sector": "Technology",
// 	"bidPrice": 58.72,
// 	"marketCap": 68286936645,
// 	"website": "http://www.micron.com",
// 	"buySize": 88228,
// 	"listDate": 631238400000,
// 	"regPercent": -0.15306122448978965,
// 	"postChange": 0.14000000000000057,
// 	"country": "US",
// 	"low": 58.87,
// 	"tickerId": 913324077,
// 	"bidSize": 200,
// 	"dealSize": 685,
// 	"mic": "XNAS",
// 	"regChange": -0.0899999999999963,
// 	"openPrice": 58.81,
// 	"dayHigh": 62.52,
// 	"liveStamp": 1527880300003,
// 	"symbol": "MU",
// 	"description": "Micron Technology Inc along with its subsidiaries provide memory and storage solutions. Its product portfolio consists of memory and storage technologies such as DRAM, NAND, NOR and 3D XPoint memory.",
// 	"dayLow": 58.08,
// 	"turnoverRate": 0.0674,
// 	"volume": 74761515,
// 	"timestamp": 1527897589000,
// 	"buyVolume": 16393881,
// 	"askPrice": 58.74,
// 	"timezone": "America/New_York",
// 	"regPrice": 58.71,
// 	"mktradeTime": 1527878148000,
// 	"statusTimestamp": 1527918727003,
// 	"sellSize": 26903,
// 	"vibrateRatio": 0.0427,
// 	"sharesFloat": 1108479925,
// 	"bidVolume": 6714519,
// 	"dealVolume": 34281976,
// 	"high": 58.88,
// 	"prevClose": 57.59,
// 	"regTimestamp": 1527883199000,
// 	"sellVolume": 16986969,
// 	"askSpread": 58.93,
// 	"avgVolume10Day": 80689169,
// 	"typeof": "STOCKS",
// 	"dealFlowSize": 61325,
// 	"askSize": 250,
// 	"startPrice": 62.41,
// 	"avgVolume3Month": 59060874,
// 	"postPercent": 0.23833844058563255,
// 	"ask": 58.93,
// 	"name": "Micron Technology Inc.",
// 	"status": "CLOSED",
// 	"closePrice": 58.74,
// 	"change": -3.529999999999994,
// 	"percent": -5.656144848581949,
// 	"open": 58.18,
// 	"askVolume": 7467125,
// 	"asks": 250,
// 	"postPrice": 58.88,
// 	"dealCount": 194714,
// 	"bids": 200,
// 	"askLot": 350
// }

// import * as benchmark from '../../common/benchmark'
// benchmark.simple('sum', [
// 	function nativeadd() {
// 		123 + 123
// 	},
// 	function coresum() {
// 		core.math.sum(123, 123)
// 	},
// 	function lodashsum() {
// 		_.sum([123, 123])
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


