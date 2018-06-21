// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pretty from '../../common/pretty'
import * as redis from '../adapters/redis'
import * as http from '../../common/http'
import * as webull from '../adapters/webull'
import * as quotes from '../adapters/quotes'
import * as hours from '../adapters/hours'
import * as dayjs from 'dayjs'
import * as boom from 'boom'
import * as pAll from 'p-all'
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
		let allrkeys = Object.keys(quotes.ALL_RKEYS)
		let symbols = req.body.symbols as string[]
		let types = (req.body.types || allrkeys) as Quotes.AllKeys[]

		let invalids = _.difference(types, allrkeys)
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

		let resolved = await pAll(symbols.map(symbol => {
			let tid = fsymbols[symbol]
			if (!Number.isFinite(tid)) return () => Promise.resolve([]);
			let url = 'https://quoteapi.webull.com/api/quote/tickerDeals/' + tid
			return () => http.get(url, { query: { count: 20 }, wbauth: true }) as Promise<Webull.Deal[]>
		}), { concurrency: 1 })

		return resolved.map(v => v.map(vv => {
			core.fix(vv)
			return quotes.toDeal(vv)
		}).sort((a, b) => b.timestamp - a.timestamp))
	}
})



polka.route({
	method: 'POST',
	url: '/api/quotes/lives',
	schema: {
		body: {
			symbols: { type: 'array', items: 'string' },
			range: { type: 'array', items: 'number', optional: true },
		},
	},
	async handler(req, res) {
		let symbols = req.body.symbols as string[]
		let range = req.body.range as number[]

		if (!Array.isArray(range)) {
			let hhours = hours.rxhours.value
			if (!hhours.isOpenToday || dayjs().isBefore(dayjs(hhours.prepre))) {
				hhours = hours.rxhours.value.previous
			}
			range = [hhours.prepre, hhours.postpost]
		}
		// let zkeys = await redis.main.coms(symbols.map(v => {
		// 	return ['zrangebyscore', `${rkeys.LIVES}:${v}`, range[0] as any, range[1] as any]
		// })) as string[][]

		let zkeys = await redis.main.coms(symbols.map(v => {
			return ['zrange', `${rkeys.LIVES}:${v}`, -512 as any, -1 as any]
		})) as string[][]
		zkeys.forEach(keys => {
			keys.remove(key => {
				let stamp = Number.parseInt(key.split(':').pop())
				return stamp < range[0]
			})
		})

		let lives = await redis.main.coms(_.flatten(zkeys.map((keys, i) => {
			return keys.map(key => ['hgetall', key])
		}))) as Quotes.Live[]
		lives.forEach(core.fix)

		let ii = 0
		return zkeys.map(keys => {
			return keys.map(() => lives[ii++]).sort((a, b) => a.timestamp - b.timestamp)
		})

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





