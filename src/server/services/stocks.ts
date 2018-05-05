// 

import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as http from '../adapters/http'
import * as redis from '../adapters/redis'
import * as webull from '../adapters/webull'
import * as rhinstruments from './symbols.service'



rhinstruments.rxready.subscribe(onLiveTickers)
async function onLiveTickers() {
	// if (!process.env.PRIMARY) return;
	
	console.warn('onLiveTickers')

	// let fsymbols = (await redis.main.get(`${redis.SYMBOLS.STOCKS}:${process.INSTANCES}:${process.INSTANCE}`) as any) as Dict<number>
	// fsymbols = JSON.parse(fsymbols as any)
	// // fsymbols = _.fromPairs(_.toPairs(fsymbols).splice(1024))
	// mqtt.options.fsymbols = fsymbols
	// mqtt.connect()



	// let tickerIds = Object.values(fsymbols)
	// let quotes = await webull.getFullQuotes(tickerIds)
	// let quote = {}
	// quotes.forEach(function(v) {
	// 	_.merge(quote, v)
	// })
	// console.log('quote ->', quote)
	// console.warn('quote ->', console.dtsgen(quote))



}





// let response = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/v2/3/foreignExchanges/1', {
// 	query: { regionIds: '1', hl: 'en', }
// }) as Webull.Ticker[]
// let tickerIds = response.map(v => v.tickerId)
// console.log('tickerIds.length ->', tickerIds.length)

// let response = await http.get('https://securitiesapi.webull.com/api/securities/market/tabs/8', {
// 	query: {}
// }) as Webull.API.TupleArrayList<Webull.Ticker>[]
// let tickerIds = response[0].tickerTupleArrayList.map(v => v.tickerId)
// console.log('tickerIds.length ->', tickerIds.length)


