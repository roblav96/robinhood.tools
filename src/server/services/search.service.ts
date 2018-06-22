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
	if (process.env.DEVELOPMENT) symbols = Object.keys(utils.DEV_STOCKS);

	let ikeys = ['name'] as KeysOf<Quotes.Quote>
	let alls = await quotes.getAlls(symbols, ['quote'], [ikeys])

	alls.forEach(all => {
		QUOTES.push({
			_symbol: all.symbol,
			symbol: core.string.alphanumeric(all.symbol).toLowerCase(),
			name: core.string.alphanumeric(pretty.company(all.quote.name)).toLowerCase(),
		})
	})

}



radio.reply('search.query', async function onquery(query: string) {
	console.time(`search.query -> ${query}`)
	let results = QUOTES.map(({ _symbol, symbol, name }, i) => {

		let s_leven = core.string.levenshtein(query, symbol)
		let s_rank = Math.max(symbol.length - s_leven, 0) * query.length

		let n_leven = core.string.levenshtein(query, name)
		let n_rank = Math.max(name.length - n_leven, 0)

		return {
			symbol: _symbol, name,
			s_length: symbol.length, s_leven, s_rank,
			n_length: name.length, n_leven, n_rank,
			rank: Math.max(s_rank, 1) * Math.max(n_rank, 1),
			// rank: s_rank + n_rank,
		}

	}).sort((a, b) => b.rank - a.rank).slice(0, 20)
	console.timeEnd(`search.query -> ${query}`)
	return results
})





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


