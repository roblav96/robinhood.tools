// 

import '../main'
import * as lunr from 'lunr'
import * as _ from '../../common/lodash'
import * as Rx from '../../common/rxjs'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pretty from '../../common/pretty'
import * as redis from '../adapters/redis'
import * as utils from '../adapters/utils'
import * as quotes from '../adapters/quotes'
import * as hours from '../adapters/hours'
import radio from '../adapters/radio'



const QUOTES = {} as Dict<Search.Quote>

radio.on('symbols.resume', start)
radio.once('symbols.start', start)
radio.emit('symbols.ready')

async function start() {
	core.nullify(QUOTES)

	let symbols = await utils.getAllSymbols()
	// if (process.env.DEVELOPMENT) symbols = Object.keys(utils.DEV_STOCKS);

	let ikeys = ['name', 'marketCap'] as KeysOf<Quotes.Quote>
	let alls = await quotes.getAlls(symbols, ['quote'], [ikeys])

	alls.forEach(({ symbol, quote }) => {
		if (symbol.includes('-')) return;
		if (symbol.includes('.') && !quote.alive) return;
		Object.assign(QUOTES, {
			[symbol]: {
				_symbol: symbol,
				marketCap: quote.marketCap,
				symbol: core.string.alphanumeric(symbol).toLowerCase(),
				name: core.string.alphanumeric(quotes.getName(quote.name)).toLowerCase(),
			} as Search.Quote
		})
	})

}



radio.reply('search.query', async function onquery(query: string) {
	return Object.keys(QUOTES).map(key => {
		let { symbol, _symbol, name } = QUOTES[key]
		let ranks = [] as number[]

		let s_leven = core.string.levenshtein(query, symbol)
		let s_rank = Math.max(symbol.length - s_leven, 2) // * Math.round(query.length / 2)
		if (query == symbol) {
			s_rank = Math.pow(s_rank, 5)
		} else if (symbol.indexOf(query) == 0) {
			s_rank = Math.pow(s_rank, 3)
		}
		ranks.push(s_rank)

		let n_leven = core.string.levenshtein(query, name)
		let n_rank = Math.max(name.length - n_leven, 2)
		if (query == name) {
			n_rank = Math.pow(n_rank, 4)
		} else if (name.indexOf(query) == 0) {
			n_rank = Math.pow(n_rank, 2)
		}
		ranks.push(n_rank)

		let result = {
			symbol: _symbol,
			rank: ranks.reduce((prev, next) => prev *= next, 2),
		} as Search.Result
		if (process.env.DEVELOPMENT) {
			Object.assign(result, { debug: { query, symbol, name, ranks } } as Search.Result)
		}
		return result

	}).sort((a, b) => {
		if (a.rank != b.rank) return b.rank - a.rank;
		return QUOTES[b.symbol].marketCap - QUOTES[a.symbol].marketCap
	}).slice(0, 20)
})





declare global {
	namespace Search {
		interface Quote extends Quotes.Quote {
			_symbol: string
		}
		interface Result {
			symbol: string
			rank: number
			debug: {
				query: string
				symbol: string
				name: string
				ranks: number[]
			}
		}
	}
}





// import * as leven from 'leven'
// import * as levenshtein from 'js-levenshtein'
// import * as similarity from 'string-similarity'
// import * as benchmark from '../../common/benchmark'
// const query = 'amd'
// const company = core.string.alphanumeric('Advanced Micro Devices').toLowerCase()
// setTimeout(() => {
// 	benchmark.simple(`Fuzzy Search -> ${query} -> ${company}`, [
// 		function Levenshtein() { levenshtein(query, company) },
// 		function Leven() { leven(query, company) },
// 		function Similarity() { similarity.compareTwoStrings(query, company) },
// 	])
// }, 3000)


