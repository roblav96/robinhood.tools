// 

import '../main'
import * as core from '../../common/core'
import * as utils from '../adapters/utils'
import * as quotes from '../adapters/quotes'
import radio from '../adapters/radio'



const QUOTES = {} as Dict<Search.Quote>

radio.on('symbols.resume', start)
radio.once('symbols.start', start)
radio.emit('symbols.ready')

async function start() {
	core.nullify(QUOTES)

	let symbols = await utils.getAllSymbols()
	// if (process.env.DEVELOPMENT) symbols = Object.keys(utils.DEV_STOCKS);

	let ikeys = ['name', 'alive', 'avgVolume'] as KeysOf<Quotes.Quote>
	let alls = await quotes.getAlls(symbols, ['quote'], [ikeys])

	alls.forEach(({ symbol, quote }) => {
		if (symbol.includes('-') && !quote.alive) return;
		if (symbol.includes('.') && !quote.alive) return;
		Object.assign(QUOTES, {
			[symbol]: {
				_symbol: symbol,
				avgVolume: quote.avgVolume,
				symbol: core.string.alphanumeric(symbol).toLowerCase(),
				name: core.string.alphanumeric(quotes.getName(quote.name)).toLowerCase(),
			} as Search.Quote
		})
	})

}



radio.reply('search.query', async function onquery(query: string) {
	let results = [] as Search.Result[]
	Object.keys(QUOTES).map(key => {
		let { symbol, _symbol, name } = QUOTES[key]
		let ranks = [] as number[]

		let sleven = core.string.levenshtein(query, symbol)
		let srank = Math.max(symbol.length - sleven, 2)
		if (query == symbol) {
			srank = Math.pow(srank, 5)
		} else if (symbol.indexOf(query) == 0) {
			srank = Math.pow(srank, 3)
		}
		ranks.push(srank)

		let nleven = core.string.levenshtein(query, name)
		let nrank = Math.max(name.length - nleven, 2)
		if (query == name) {
			nrank = Math.pow(nrank, 4)
		} else if (name.indexOf(query) == 0) {
			nrank = Math.pow(nrank, 2)
		}
		ranks.push(nrank)

		let rank = ranks.reduce((prev, next) => prev *= next, 2)
		if (rank == 8) return;

		let result = {
			symbol: _symbol, rank,
		} as Search.Result
		if (process.env.DEVELOPMENT) {
			Object.assign(result, { debug: { query, symbol, name, ranks } } as Search.Result)
		}
		results.push(result)

	})
	results.sort((a, b) => {
		if (a.rank == b.rank) {
			return QUOTES[b.symbol].avgVolume - QUOTES[a.symbol].avgVolume
		}
		return b.rank - a.rank
	})
	results.remove((v, i) => i > 20)
	return results
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





import * as levenshtein from 'js-levenshtein'
import * as hyperid from 'hyperid'
import * as benchmark from '../../common/benchmark'
const query = 'amd'
const company = core.string.alphanumeric('Advanced Micro Devices').toLowerCase()
setTimeout(() => {
	benchmark.simple(`Fuzzy Search -> ${query} -> ${company}`, [
		function Levenshtein() { levenshtein(query, company) },
		function Hyperid() { hyperid().uuid },
	])
}, 3000)


