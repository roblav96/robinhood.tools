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
const WB_SAVES = {} as Dict<Webull.Quote>
const WB_EMITS = {} as Dict<Webull.Quote>

const CALCS = {} as Dict<Quotes.Calc>
const LIVES = {} as Dict<Quotes.Live>
const MINUTES = {} as Dict<Quotes.Live>
const EMITS = {} as Dict<Quotes.Calc>

radio.once('symbols.ready', onsymbols)
radio.emit('symbols.start')
if (process.env.SYMBOLS == 'STOCKS') {
	radio.on('symbols.reset', onsymbols)
}
declare global { namespace NodeJS { interface ProcessEnv { SYMBOLS: TypeofSymbols } } }

async function onsymbols(event: Radio.Event) {

	clock.offListener(ontick)
	MQTTS.remove(v => !v.destroy())
	core.nullify(SYMBOLS)
	core.nullify(WB_QUOTES); core.nullify(WB_SAVES); core.nullify(WB_EMITS);
	core.nullify(CALCS); core.nullify(LIVES); core.nullify(MINUTES); core.nullify(EMITS);

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

		quotes.toConform(quote, quotes.CALC_KEYS_ALL)
		Object.assign(CALCS, { [symbol]: core.clone(quote) })
		Object.assign(LIVES, { [symbol]: core.clone(quote) })
		Object.assign(MINUTES, { [symbol]: core.clone(quote) })
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
		let toquote = quotes.applydeal(CALCS[symbol], deal)
		core.object.mergeAll([CALCS[symbol], EMITS[symbol]], toquote)
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

	let tokeys = Object.keys(towbquote)
	if (tokeys.length > 0) {
		core.object.mergeAll([WB_QUOTES[symbol], WB_EMITS[symbol]], towbquote, tokeys)
		// console.info(symbol, webull.mqtt_topics[topic], '->\ntowbquote ->', towbquote)

		if (topic == webull.mqtt_topics.TICKER_BID_ASK) {
			let toquote = quotes.applybidask(CALCS[symbol], towbquote)
			core.object.mergeAll([CALCS[symbol], EMITS[symbol]], toquote)
		}
	}
})



function ontick(i: number) {
	let live = i % 10 == 0
	let minute = i % 60 == 0

	let coms = [] as Redis.Coms
	SYMBOLS.forEach(symbol => {

		let wbquote = WB_EMITS[symbol]
		let toquote = EMITS[symbol]
		let quote = CALCS[symbol]
		let fquote = LIVES[symbol]
		let mquote = MINUTES[symbol]

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

			let diff = core.object.difference(fquote, quote)
			if (Object.keys(diff).length > 0) {

				coms.push(['hmset', `${rkeys.QUOTES}:${symbol}`, diff as any])
				if (diff.timestamp && quote.timestamp > fquote.timestamp) {

					quote.liveCount++

					let lkey = `${rkeys.LIVES}:${symbol}:${quote.timestamp}`
					let lquote = quotes.getConformed(quote, quotes.LIVE_KEYS_ALL)
					coms.push(['hmset', lkey, lquote as any])

					let zkey = `${rkeys.LIVES}:${symbol}`
					coms.push(['zadd', zkey, quote.timestamp as any, lkey])

					socket.emit(`${rkeys.LIVES}:${symbol}`, lquote)

					core.object.merge(quote, quotes.resetlive(quote))
					core.object.merge(LIVES[symbol], quote)
				}
			}
		}

		if (minute) {
			let diff = core.object.difference(mquote, quote)
			if (Object.keys(diff).length > 0 && diff.timestamp && quote.timestamp > mquote.timestamp) {

				let mkey = `${rkeys.MINUTES}:${symbol}:${quote.timestamp}`
				let lquote = quotes.getConformed(quote, quotes.LIVE_KEYS_ALL)
				coms.push(['hmset', mkey, lquote as any])

				let zkey = `${rkeys.MINUTES}:${symbol}`
				coms.push(['zadd', zkey, quote.timestamp as any, mkey])

				socket.emit(`${rkeys.MINUTES}:${symbol}`, lquote)

				core.object.merge(MINUTES[symbol], quote)
			}
		}

	})

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


