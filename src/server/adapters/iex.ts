// 

export * from '../../common/iex'
import * as pAll from 'p-all'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as iex from '../../common/iex'
import * as redis from './redis'
import * as http from '../../common/http'



export async function getItems(symbols: string[], types = [
	'company',
	'earnings',
	'estimates',
	'financials',
	'peers',
	'quote',
	'relevant',
	'stats',
]) {
	let response = await http.get('https://api.iextrading.com/1.0/stock/market/batch', {
		query: { symbols: symbols.join(','), types: types.join(',') },
	}) as Iex.BatchResponse
	return Object.keys(response).map(function(symbol) {
		let item = { symbol } as Iex.Item
		let values = response[symbol]
		Object.keys(values).forEach(function(key) {
			let value = values[key]
			if (core.object.is(value)) core.object.repair(item, value);
			if (Array.isArray(value)) item[key] = value;
		})
		return item
	})
}



export async function syncItems(symbols: string[]) {
	let chunks = core.array.chunks(symbols, _.ceil(symbols.length / 100))
	await pAll(chunks.map(chunk => {
		return () => getItems(chunk).then(function(items) {
			return redis.main.coms(items.map(item => {
				let mapped = _.mapValues(item, (v, k) => {
					return typeof v == 'object' ? JSON.stringify(v) : v
				})
				return ['hmset', `${rkeys.IEX.ITEMS}:${item.symbol}`, mapped as any]
			}))
		})
	}), { concurrency: 2 })
}


