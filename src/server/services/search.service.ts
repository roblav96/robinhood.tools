// 

import '../main'
import * as lunr from 'lunr'
import * as _ from '../../common/lodash'
import * as Rx from '../../common/rxjs'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as utils from '../adapters/utils'
import * as quotes from '../adapters/quotes'
import * as hours from '../adapters/hours'
import radio from '../adapters/radio'



let INDEX = lunr(_.noop)

radio.once('symbols.start', start)
radio.emit('symbols.ready')

Rx.subscription(hours.rxstate).subscribe(state => {
	if (state == 'PREPRE') start();
})

async function start() {

	let symbols = await utils.getAllSymbols()
	let ikeys = ['name'] as KeysOf<Quotes.Quote>
	let alls = await quotes.getAlls(symbols, ['quote'], [ikeys])

	let builder = new lunr.Builder()
	// builder.metadataWhitelist = ['position']
	builder.ref('symbol')
	builder.field('symbol')
	builder.field('name')
	alls.forEach(all => {
		builder.add({
			symbol: all.symbol.toLowerCase(),
			name: core.string.clean(all.quote.name).toLowerCase(),
		} as Quotes.Quote)
	})
	INDEX = builder.build()

}



const MAX = 20
radio.reply('search.query', async function onquery(query: string) {
	let words = query.split(' ')
	console.time(`search.query`)
	let results = INDEX.query(function(q) {
		if (words.length == 1) {
			q.term(query, {
				fields: ['symbol'],
				boost: 10000,
			})
			q.term(query, {
				fields: ['symbol'],
				boost: 750,
				wildcard: lunr.Query.wildcard.TRAILING,
			})
			q.term(query, {
				fields: ['symbol'],
				boost: 500,
				wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING,
			})
			q.term(query, {
				fields: ['symbol'],
				boost: 250,
				editDistance: 1,
			})
		}
		words.forEach(word => {
			q.term(word, {
				fields: ['name'],
				boost: 100,
			})
			q.term(word, {
				fields: ['name'],
				boost: 75,
				wildcard: lunr.Query.wildcard.TRAILING,
			})
			q.term(word, {
				fields: ['name'],
				boost: 50,
				wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING,
			})
			q.term(word, {
				fields: ['name'],
				boost: 25,
				editDistance: 1,
			})
		})
	})
	console.timeEnd(`search.query`)
	results.splice(MAX)
	// console.log('results ->', results)
	return results.map(v => v.ref.toUpperCase())
})





// let searches = [] as string[]
// if (!query.includes(' ')) {
// 	searches.push(...[
// 		`symbol:${query}^10000000`,
// 		`symbol:${query}*^1000000`,
// 		`symbol:*${query}*^100000`,
// 		`symbol:${query}~1^10000`,
// 	])
// }
// searches.push(...[
// 	`name:${query}^1000`,
// 	`name:${query}*^100`,
// 	`name:*${query}*^10`,
// 	`name:${query}~1`,
// ])
// console.log(`searches ->`, searches)
// let results = INDEX.search(searches.join(' '))


