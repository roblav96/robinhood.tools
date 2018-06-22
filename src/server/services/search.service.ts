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



let QUOTES = [] as Partial<Quotes.Quote & { _symbol: string, word: string }>[]

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
		QUOTES.push({
			_symbol: all.symbol,
			symbol: core.string.alphanumeric(all.symbol).toLowerCase(),
			name: core.string.alphanumeric(pretty.company(all.quote.name)).toLowerCase(),
			word: core.string.alphanumeric(pretty.company(all.quote.name).split(' ').shift()).toLowerCase(),
		})
	})

}



radio.reply('search.query', async function onquery(query: string) {
	let stamp = Date.now()
	let results = QUOTES.map(({ _symbol, symbol, name, word }) => {
		let ranks = [] as number[]

		let s_leven = core.string.levenshtein(query, symbol)
		let s_rank = Math.max(symbol.length - s_leven, 1)// * Math.round(query.length / 2)
		if (query.length <= symbol.length && symbol.indexOf(query) == 0) {
			s_rank *= s_rank
		}
		ranks.push(s_rank)

		let n_leven = core.string.levenshtein(query, name)
		let n_rank = Math.max(name.length - n_leven, 1)
		if (query.length > 2 && name.indexOf(query) == 0) {
			n_rank *= n_rank
		}
		ranks.push(n_rank)

		// let w_leven = core.string.levenshtein(query, word)
		// let w_rank = Math.max(Math.max(word.length - w_leven, 0) * query.length, 1) // * Math.round(query.length / 2), 1)
		// if (query.length > symbol.length && word.indexOf(query) == 0) {
		// 	w_rank *= w_rank
		// }
		// rank *= w_rank

		// let f_rank = query.length > symbol.length && word.indexOf(query) == 0 ? rank : 1
		// rank *= f_rank

		return { symbol: _symbol, ranks, rank: ranks.reduce((prev, next) => prev *= next, 1) }
		// return {
		// 	symbol: _symbol, name,
		// 	s_length: symbol.length, s_leven, s_rank,
		// 	n_length: name.length, n_leven, n_rank,
		// 	rank: Math.max(s_rank, 1) * Math.max(n_rank, 1),
		// 	// rank: s_rank + n_rank,
		// }

	}).sort((a, b) => b.rank - a.rank).slice(0, 20)
	console.warn(`search.query -> ${query}`, pretty.ms(Date.now() - stamp))
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


