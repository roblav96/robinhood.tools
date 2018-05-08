// 

import '../main'
import * as pAll from 'p-all'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as schedule from 'node-schedule'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as hours from '../adapters/hours'
import * as socket from '../adapters/socket'
import * as utils from '../adapters/utils'
import * as webull from '../adapters/webull'
import * as http from '../adapters/http'
import clock from '../../common/clock'



async function readyIndexes() {
	let exists = await redis.main.exists(rkeys.INDEXES.SYMBOLS) as number
	if (exists == 0) await syncIndexes(webull.indexes);
}
readyIndexes().catch(function(error) {
	console.error('readyIndexes Error ->', error)
})

async function syncIndexes(indexes: string[]) {
	let symbols = core.clone(indexes)
	let tickers = await pAll(symbols.map(symbol => {
		return () => getTicker(symbol)
	}), { concurrency: 1 })
	let url = 'https://securitiesapi.webull.com/api/securities/market/tabs/v2/globalIndices/1'
	let response = await http.get(url, { query: { hl: 'en' } }) as Webull.Api.MarketIndex[]
	response.forEach(v => v.marketIndexList.forEach(vv => tickers.push(vv)))
	tickers = _.orderBy(tickers.filter(v => v), 'disSymbol')
	let fsymbols = {} as Dict<number>
	tickers.forEach(v => fsymbols[v.disSymbol] = v.tickerId)
	console.log('fsymbols ->', fsymbols)
}

async function getTicker(symbol: string) {
	let response = await http.get('https://infoapi.webull.com/api/search/tickers2', {
		query: { keys: symbol, tickerType: 1 }
	}) as Webull.Api.Paginated<Webull.Ticker>
	if (!Array.isArray(response.list)) return;
	return response.list.find(v => v.disSymbol == symbol)
}


