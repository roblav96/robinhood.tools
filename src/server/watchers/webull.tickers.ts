// 

import * as _ from 'lodash'
import * as pAll from 'p-all'
import * as fuzzy from 'fuzzysort'
import * as leven from 'leven'
import * as Rx from '../../common/rxjs'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as robinhood from '../adapters/robinhood'
import * as core from '../../common/core'
import * as rhinstruments from './robinhood.instruments'
import clock from '../../common/clock'
import radio from '../adapters/radio'



export const ready = new Rx.ReadySubject()

if (process.WORKER) {
	rhinstruments.ready.toPromise().then(readyTickers).catch(function(error) {
		console.error('readyTickers Error ->', error)
	}).finally(function() {
		ready.next()
	})
}



async function readyTickers() {
	let symbols = await robinhood.getSymbols()
	console.log('symbols.length ->', console.inspect(symbols.length))

	await syncTickers(symbols)

	console.info('readyTickers -> done')

}



async function syncTickers(symbols: string[]) {
	await pAll(symbols.map(v => () => getTicker(v)), { concurrency: 1 })
	// await getTicker('NVDA')

	console.info('syncTickers -> done')

}

async function getTicker(symbol: string) {
	let instrument = await redis.main.hgetall(`${redis.RH.INSTRUMENTS}:${symbol}`) as Robinhood.Instrument
	core.fix(instrument)
	console.warn('symbol ->', console.inspect(symbol))
	console.log('instrument ->', console.inspect(instrument))

	let mic = _.compact(instrument.market.split('/')).pop()
	let acronym = robinhood.MICS[mic]

	let response = await http.get('https://infoapi.webull.com/api/search/tickers2', {
		query: { keys: symbol },
	}) as Webull.API.Paginated<Webull.Ticker>

	if (Array.isArray(response.list)) {
		let tickers = response.list.filter(function(ticker) {
			return ticker.disSymbol.indexOf(symbol) == 0
		})
		let scores = tickers.map(function(ticker, i) {
			let score = 0
			score += leven(instrument.symbol, ticker.disSymbol)
			score += leven(acronym, ticker.disExchangeCode)
			score += leven(instrument.country, ticker.regionAlias)
			let iname = core.string.alphanumeric(instrument.simple_name || instrument.name).toLowerCase()
			let tname = core.string.alphanumeric(ticker.tinyName || ticker.tickerName).toLowerCase()
			score += leven(iname, tname)
			return { i, score }
		})
		scores.sort((a, b) => a.score - b.score)
		let winner = scores.shift()
		let ticker = response.list[winner.i]
		console.log('ticker ->', console.inspect(ticker))
	}

	await clock.pEvent('5s')

}


