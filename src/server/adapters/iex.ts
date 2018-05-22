// 

export * from '../../common/iex'
import * as pAll from 'p-all'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as iex from '../../common/iex'
import * as redis from './redis'
import * as http from './http'



export function getBatch(symbols: string[], types = [
	'company',
	'earnings',
	'estimates',
	'financials',
	'peers',
	'quote',
	'relevant',
	'stats',
]) {
	return http.get('https://api.iextrading.com/1.0/stock/market/batch', {
		query: { symbols: symbols.join(','), types: types.join(',') },
	}) as Promise<Iex.BatchResponse>
}



export async function syncBatch(symbols: string[]) {
	let chunks = core.array.chunks(symbols, _.ceil(symbols.length / 100))
	let response = await pAll(chunks.map(chunk => {
		return () => getBatch(chunk).then(async function(response: Iex.BatchResponse) {
			let coms = [] as Redis.Coms
			Object.keys(response).forEach(function(symbol) {
				let values = response[symbol]
				Object.keys(values).forEach(function(key) {
					let value = values[key]
					if (!value || _.isEmpty(value)) return delete values[key];
					if (core.object.is(value)) value.symbol = symbol;
				})
				coms.push(['hmset', `${rkeys.IEX.BATCH}:${symbol}`, _.mapValues(values, v => JSON.stringify(v)) as any])
			})
			await redis.main.coms(coms)
			return response
		})
	}), { concurrency: 1 })
	return response.reduce(function(previous, current, index) {
		return Object.assign(previous, current)
	}, {})
}


