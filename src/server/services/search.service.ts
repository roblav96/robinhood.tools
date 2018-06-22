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
	console.log(`alls ->`, JSON.stringify(alls, null, 4))

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

		let sleven = core.string.levenshtein(query, symbol)
		let srank = query.length - sleven
		// let srank = core.calc.slider(sleven, symbol.length, query.length)
		// let ssrank = (query.length - symbol.length) + srank

		return {
			symbol: _symbol, name,
			queryL: query.length,
			symbolL: symbol.length,
			sleven, srank,
			// rank: srank, // + nrank
		}

	}).sort((a, b) => a.srank - b.srank).slice(0, 20)
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


