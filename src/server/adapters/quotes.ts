// 

export * from '../../common/quotes'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as quotes from '../../common/quotes'
import * as redis from '../adapters/redis'
import * as utils from '../adapters/utils'
import * as hours from '../adapters/hours'
import * as pAll from 'p-all'
import * as dayjs from 'dayjs'



export async function getAlls(symbols: string[], allrkeys = Object.keys(quotes.ALL_RKEYS) as Quotes.AllKeys[], allkeys = [] as string[][]) {
	let resolved = await redis.main.coms(_.flatten(symbols.map(v => {
		return allrkeys.map((k, i) => {
			let rkey = `${quotes.ALL_RKEYS[k]}:${v}`
			let ikeys = allkeys[i]
			if (Array.isArray(ikeys)) {
				return ['hmget', rkey].concat(ikeys)
			}
			return ['hgetall', rkey]
		})
	})))
	let ii = 0
	return symbols.map(symbol => {
		let all = { symbol } as Quotes.All
		allrkeys.forEach((k, i) => {
			let resolve = resolved[ii++]
			let ikeys = allkeys[i]
			if (Array.isArray(ikeys)) {
				resolve = redis.fixHmget(resolve, ikeys)
			}
			core.fix(resolve || {})
			resolve.symbol = symbol
			all[k] = resolve
		})
		return all
	})
}



export async function syncAllQuotes(resets = false) {
	console.info('syncAllQuotes -> start');
	let symbols = await utils.getAllSymbols()

	if (process.env.DEVELOPMENT) {
		// symbols = Object.keys(utils.DEV_STOCKS)
		// let ikeys = ['____', '____', '____', '____'] as KeysOf<Quotes.Quote>
		// let coms = symbols.map(v => ['hdel', `${rkeys.QUOTES}:${v}`].concat(ikeys))
		// await redis.main.coms(coms)
	}

	let ago = dayjs(hours.rxhours.value.previous.date).subtract(3, 'day').valueOf()
	let chunks = core.array.chunks(symbols, _.ceil(symbols.length / 256))
	await pAll(chunks.map((chunk, i) => async () => {
		console.log('syncAllQuotes ->', `${_.round((i / chunks.length) * 100)}%`);

		if (resets && process.env.PRODUCTION) {
			let coms = [] as Redis.Coms
			let zkeys = await redis.main.coms(chunk.map(v => {
				coms.push(['zremrangebyscore', `${rkeys.LIVES}:${v}`, '-inf', ago as any])
				return ['zrangebyscore', `${rkeys.LIVES}:${v}`, '-inf', ago as any]
			})) as string[][]
			chunk.forEach((v, i) => {
				if (zkeys[i].length == 0) return;
				coms.push(['del'].concat(zkeys[i]))
			})
			await redis.main.coms(coms)
		}

		let alls = await getAlls(chunk)
		await redis.main.coms(alls.map(all => {
			let rkey = `${rkeys.QUOTES}:${all.symbol}`
			return ['hmset', rkey, quotes.applyFull(all, resets) as any]
		}))

	}), { concurrency: 1 })
	console.info('syncAllQuotes -> done');
}


