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
	[rkeys.QUOTES]: 'quote',
	[rkeys.WB.TICKERS]: 'wbticker',
	[rkeys.WB.QUOTES]: 'wbquote',
	[rkeys.RH.INSTRUMENTS]: 'instrument',
	[rkeys.YH.QUOTES]: 'yhquote',
	[rkeys.IEX.ITEMS]: 'iexitem',
}

polka.route({
	method: 'POST',
	url: '/api/symbols/rkeys',
	schema: {
		body: {
			symbols: { type: 'array', items: 'string' },
			rkeys: { type: 'array', items: 'string', optional: true },
		},
	},
	async handler(req, res) {
		let allkeys = Object.keys(RKEYS)
		let symbols = req.body.symbols as string[]
		let rkeys = (req.body.rkeys || allkeys) as string[]

		let invalids = _.difference(rkeys, allkeys)
		if (invalids.length > 0) throw boom.notAcceptable(invalids.toString(), { invalids });

		let coms = [] as Redis.Coms
		symbols.forEach(function(symbol) {
			rkeys.forEach(rkey => coms.push(['hgetall', `${rkey}:${symbol}`]))
		})
		let resolved = await redis.main.coms(coms)
		resolved.forEach(core.fix)

		let ii = 0
		return symbols.map(symbol => {
			return rkeys.reduce((prev, curr) => {
				prev[RKEYS[curr]] = resolved[ii++]
				return prev
			}, {})
		})
	}
})



polka.route({
	method: 'POST',
	url: '/api/symbols/deals',
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
			if (!Number.isFinite(tid)) return () => Promise.resolve([]);
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





