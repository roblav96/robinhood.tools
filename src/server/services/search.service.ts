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



let QUOTES = [] as Partial<Quotes.Quote & { _symbol: string }>[]

radio.on('symbols.resume', start)
radio.once('symbols.start', start)
radio.emit('symbols.ready')

async function start() {
	core.nullify(QUOTES)

	let symbols = await utils.getAllSymbols()
	// if (process.env.DEVELOPMENT) symbols = Object.keys(utils.DEV_STOCKS);

	let ikeys = ['name'] as KeysOf<Quotes.Quote>
	let alls = await quotes.getAlls(symbols, ['quote'], [ikeys])

	alls.forEach(all => {
		if (all.symbol.includes('-')) return;
		QUOTES.push({
			_symbol: all.symbol,
			symbol: core.string.clean(all.symbol).toLowerCase(),
			name: core.string.clean(pretty.company(all.quote.name)).toLowerCase(),
		})
	})

}



radio.reply('search.query', async function onquery(query: string) {
	let stamp = Date.now()
	let results = QUOTES.map(({ _symbol, symbol, name }) => {
		let ranks = [] as number[]

		let s_leven = core.string.levenshtein(query, symbol)
		let s_rank = Math.max(symbol.length - s_leven, 1) // * Math.round(query.length / 2)
		if (symbol.indexOf(query) == 0) s_rank = Math.pow(s_rank, 3);
		ranks.push(s_rank)

		let n_leven = core.string.levenshtein(query, name)
		let n_rank = Math.max(name.length - n_leven, 1)
		if (name.indexOf(query) == 0) n_rank = Math.pow(n_rank, 2);
		ranks.push(n_rank)

		let result = {
			symbol: _symbol,
			rank: ranks.reduce((prev, next) => prev *= next, 1),
		} as Search.Result
		if (process.env.DEVELOPMENT) result.ranks = ranks;
		return result

		// }).sort((a, b) => b.rank - a.rank).slice(0, 20)
	})
	results = _.orderBy(results, ['rank', 'symbol'], ['desc', 'asc']).slice(0, 20)
	console.log(`search.query -> ${query}`, pretty.ms(Date.now() - stamp))
	return results
})





declare global {
	namespace Search {
		interface Result {
			symbol: string
			rank: number
			ranks: number[]
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


