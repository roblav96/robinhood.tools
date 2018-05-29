// 

import * as boom from 'boom'
import * as pAll from 'p-all'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as quotes from '../adapters/quotes'
import polka from './polka'



polka.route({
	method: 'POST',
	url: '/api/quotes/alls',
	schema: {
		body: {
			symbols: { type: 'array', items: 'string' },
			types: { type: 'array', items: 'string', optional: true },
		},
	},
	async handler(req, res) {
		let allkeys = Object.keys(quotes.ALL_KEYS)
		let symbols = req.body.symbols as string[]
		let types = (req.body.types || allkeys) as (keyof typeof quotes.ALL_KEYS)[]

		let invalids = _.difference(types, allkeys)
		if (invalids.length > 0) throw boom.notAcceptable(invalids.toString(), { invalids });

		return quotes.getAlls(symbols, types)
	}
})



polka.route({
	method: 'POST',
	url: '/api/quotes/deals',
	schema: {
		body: { symbols: { type: 'array', items: 'string' } },
	},
	async handler(req, res) {
		let symbols = req.body.symbols as string[]

		let fsymbols = await redis.main.hmget(rkeys.WB.TIDS, ...symbols) as Dict<number>
		fsymbols = redis.fixHmget(fsymbols, symbols)
		fsymbols = _.mapValues(fsymbols, v => Number.parseInt(v as any))
		// fsymbols = _.filter(fsymbols, v => Number.isFinite(v)) as any

		let resolved = await pAll(symbols.map(symbol => {
			let tid = fsymbols[symbol]
			if (!Number.isFinite(tid)) return () => Promise.resolve([]);
			let url = 'https://quoteapi.webull.com/api/quote/tickerDeals/' + tid
			return () => http.get(url, { query: { count: 20 }, wbauth: true }) as Promise<Webull.Deal[]>
		}), { concurrency: 1 })

		return resolved.map(v => v.map(vv => {
			core.fix(vv)
			return quotes.todeal(vv)
		}).sort((a, b) => b.timestamp - a.timestamp))
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





