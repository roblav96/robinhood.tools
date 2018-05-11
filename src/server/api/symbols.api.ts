// 

import * as boom from 'boom'
import * as pAll from 'p-all'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import polka from './polka'



const RKEYS = {
	instruments: rkeys.RH.INSTRUMENTS,
	tickers: rkeys.WB.TICKERS,
	quotes: rkeys.WB.QUOTES,
}
const ALLOWED = Object.keys(RKEYS)

polka.route({
	method: 'POST',
	url: '/api/symbols',
	public: true,
	schema: {
		body: {
			symbols: { type: 'array', items: 'string' },
			dockeys: { type: 'array', items: 'string', optional: true },
		},
	},
	async handler(req, res) {
		let symbols = req.body.symbols as string[]
		let dockeys = req.body.dockeys as string[]
		if (!Array.isArray(dockeys)) dockeys = ALLOWED as any;

		let invalids = _.difference(dockeys, ALLOWED)
		if (invalids.length > 0) throw boom.notAcceptable(invalids.toString(), { invalids });

		let coms = [] as Redis.Coms
		symbols.forEach(function(symbol) {
			dockeys.forEach(function(dockey) {
				coms.push(['hgetall', `${RKEYS[dockey]}:${symbol}`])
			})
		})
		let resolved = await redis.main.coms(coms)
		resolved.forEach(core.fix)
		return resolved

		// let ii = 0
		// let response = core.array.dict(dockeys, [])
		// symbols.forEach(() => {
		// 	dockeys.forEach(v => response[v].push(resolved[ii++]))
		// })
		// return response
	}
})



polka.route({
	method: 'POST',
	url: '/api/symbols/deals',
	public: true,
	schema: {
		body: { symbols: { type: 'array', items: 'string' } },
	},
	async handler(req, res) {
		let symbols = req.body.symbols as string[]
		let fsymbols = await redis.main.hmget(rkeys.WB.TIDS, ...symbols) as Dict<number>
		fsymbols = redis.fixHmget(fsymbols, symbols)
		fsymbols = _.mapValues(fsymbols, v => Number.parseInt(v as any))
		let resolved = await pAll(symbols.map(symbol => {
			let tid = fsymbols[symbol]
			let url = 'https://quoteapi.webull.com/api/quote/tickerDeals/' + tid
			return () => http.get(url, { query: { count: 20 }, wbauth: true }) as Promise<Webull.Deal[]>
		}), { concurrency: 1 })
		let response = resolved.map(v => v.map(vv => {
			core.fix(vv)
			vv.tradeTime = new Date(vv.tradeTime).valueOf()
			delete vv.tickerId
			return vv
		}))
		response.forEach(v => v.sort((a, b) => b.tradeTime - a.tradeTime))
		return response
	}
})



// polka.route({
// 	method: 'POST',
// 	url: '/api/symbols/instruments',
// 	public: true,
// 	schema: {
// 		body: { symbols: { type: 'array', items: 'string' } },
// 	},
// 	async handler(req, res) {
// 		let symbols = req.body.symbols as string[]
// 		let coms = symbols.map(v => ['hgetall', `${rkeys.RH.INSTRUMENTS}:${v}`])
// 		let instruments = await redis.main.coms(coms) as Robinhood.Instrument[]
// 		instruments.forEach(core.fix)
// 		return instruments.map(function(v) {
// 			return _.pick(v, ['symbol', 'name', 'type'] as KeysOf<Robinhood.Instrument>)
// 		})
// 	}
// })





