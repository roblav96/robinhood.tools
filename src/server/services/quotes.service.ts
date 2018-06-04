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



declare global { namespace NodeJS { interface ProcessEnv { SYMBOLS: TypeOfSymbols } } }
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
	if (state == 'PREPRE') start();
})

async function start() {

	clock.offListener(ontick)
	MQTTS.remove(v => { v.destroy(); return true })
	core.nullify(SYMBOLS)
	core.nullify(WB_QUOTES); core.nullify(WB_SAVES); core.nullify(WB_EMITS);
	core.nullify(QUOTES); core.nullify(LIVES); core.nullify(EMITS);

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

		Object.assign(WB_QUOTES, { [symbol]: core.clone(wbquote) })
		Object.assign(WB_SAVES, { [symbol]: {} })
		Object.assign(WB_EMITS, { [symbol]: {} })

		quotes.convert(quote, quotes.ALL_CALC_KEYS)
		Object.assign(QUOTES, { [symbol]: core.clone(quote) })
		Object.assign(LIVES, { [symbol]: core.clone(quote) })
		Object.assign(EMITS, { [symbol]: {} })

		socket.emit(`${rkeys.QUOTES}:${symbol}`, quote)

	})

	// let chunks = core.array.chunks(_.toPairs(fsymbols), _.ceil(SYMBOLS.length / 256))
	// MQTTS.splice(0, Infinity, ...chunks.map((chunk, i) => new WebullMqttClient({
	// 	fsymbols: _.fromPairs(chunk),
	// 	topics: process.env.SYMBOLS,
	// 	verbose: true,
	// }, emitter)))

	clock.on('1s', ontick)

}



emitter.on('data', function ondata(topic: number, wbquote: Webull.Quote) {
	let symbol = wbquote.symbol
	if (!symbol) return console.warn(`!symbol ->`, webull.mqtt_topics[topic], wbquote);

	if (topic == webull.mqtt_topics.TICKER_DEAL_DETAILS) {
		let deal = quotes.todeal(wbquote)
		socket.emit(`${rkeys.DEALS}:${symbol}`, deal)
		let quote = QUOTES[symbol]
		let toquote = quotes.applydeal(quote, deal)
		quotes.applylives(quote, LIVES[symbol], toquote)
		core.object.mergeAll([quote, EMITS[symbol]], toquote)
		return
	}

	// console.log(symbol, webull.mqtt_topics[topic], '->\nwbquote ->', wbquote)
	let towbquote = {} as Webull.Quote
	let quote = WB_QUOTES[symbol]
	if (!quote) return console.warn(symbol, webull.mqtt_topics[topic], `!quote ->\nwbquote ->`, wbquote);

	Object.keys(wbquote).forEach(key => {
		let to = wbquote[key]
		let from = quote[key]
		if (from == null) { from = to; quote[key] = to; towbquote[key] = to }
		let keymap = quotes.KEY_MAP[key]
		quotes.applykeymap(keymap, towbquote, key, to, from)
	})

	let tokeys = Object.keys(towbquote)
	if (tokeys.length > 0) {
		// console.info(symbol, webull.mqtt_topics[topic], '->\ntowbquote ->', towbquote)
		core.object.mergeAll([WB_QUOTES[symbol], WB_EMITS[symbol]], towbquote, tokeys)

		if (topic == webull.mqtt_topics.TICKER_BID_ASK) {
			let quote = QUOTES[symbol]
			let toquote = quotes.applybidask(quote, towbquote)
			quotes.applylives(quote, LIVES[symbol], toquote)
			core.object.mergeAll([quote, EMITS[symbol]], toquote)
		}
	}
})



function ontick(i: number) {
	// console.time(`ontick`)
	let live = i % 10 == core.math.dispersed(10, +process.env.INSTANCE, +process.env.SCALE)

	console.log(`1s ->`, i)
	// console.log(`1s ->`, utils.cpuUsage())

	let coms = [] as Redis.Coms
	SYMBOLS.forEach(symbol => {

		let quote = QUOTES[symbol]
		let toquote = EMITS[symbol]
		let towbquote = WB_EMITS[symbol]

		if (Object.keys(towbquote).length > 0) {
			core.object.merge(WB_SAVES[symbol], towbquote)
			quotes.applywbquote(quote, towbquote, toquote)
			quotes.applylives(quote, LIVES[symbol], toquote)
			core.object.merge(quote, toquote)
			towbquote.symbol = symbol
			socket.emit(`${rkeys.WB.QUOTES}:${symbol}`, towbquote)
			Object.assign(WB_EMITS, { [symbol]: {} })
		}

		quotes.applylives(quote, LIVES[symbol], toquote)
		quotes.applycalcs(quote, toquote)
		core.object.merge(quote, toquote)

		if (Object.keys(toquote).length > 0) {
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
				coms.push(['hmset', `${rkeys.QUOTES}:${symbol}`, diff as any])
				if (diff.timestamp && quote.timestamp > fquote.timestamp) {

					quote.liveCount++
					quote.liveStamp = Date.now()

					let lkey = `${rkeys.LIVES}:${symbol}:${quote.timestamp}`
					let lquote = quotes.getConverted(quote, quotes.ALL_LIVE_KEYS)
					coms.push(['hmset', lkey, lquote as any])
					let zkey = `${rkeys.LIVES}:${symbol}`
					coms.push(['zadd', zkey, quote.timestamp as any, lkey])
					socket.emit(`${rkeys.LIVES}:${symbol}`, lquote)

					core.object.merge(quote, quotes.resetlive(quote))
					core.object.merge(fquote, quote)

				}
			}
		}

	})

	// console.timeEnd(`ontick`)

	redis.main.coms(coms)
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
// benchmark.simple('fix', [
// 	function fastfix() {
// 		core.fastfix(JSON.parse(JSON.stringify(mock)))
// 	},
// 	function corefix() {
// 		core.fix(JSON.parse(JSON.stringify(mock)))
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


