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



let search = lunr(_.noop)

radio.on('symbols.resume', start)
radio.once('symbols.start', start)
radio.emit('symbols.ready')

async function start() {

	let symbols = await utils.getAllSymbols()
	let ikeys = ['name', 'tinyName'] as KeysOf<Quotes.Quote>
	let alls = await quotes.getAlls(symbols, ['quote'], [ikeys])

	let builder = new lunr.Builder()
	// builder.metadataWhitelist = ['position']
	builder.ref('_symbol')
	builder.field('symbol')
	builder.field('name')
	builder.field('tinyName')
	alls.forEach(all => {
		builder.add({
			_symbol: all.symbol,
			symbol: core.string.alphanumeric(all.symbol).toLowerCase(),
			name: core.string.alphanumeric(all.quote.name, ' ').toLowerCase(),
			tinyName: core.string.alphanumeric(all.quote.tinyName, ' ').toLowerCase(),
		})
	})
	search = builder.build()

}



radio.reply('search.query', async function onquery(query: string) {
	let words = query.split(' ')
	let results = search.query(function(q) {
		if (words.length == 1) {
			q.term(query, {
				fields: ['symbol'],
				boost: 1000000,
			})
			q.term(query, {
				fields: ['symbol'],
				boost: 100000,
				wildcard: lunr.Query.wildcard.TRAILING,
			})
			q.term(query, {
				fields: ['symbol'],
				boost: 10000,
				wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING,
			})
			q.term(query, {
				fields: ['symbol'],
				boost: 1000,
				editDistance: 1,
			})
		}
		words.forEach(word => {
			q.term(word, {
				fields: ['name', 'tinyName'],
				boost: 100,
			})
			q.term(word, {
				fields: ['name', 'tinyName'],
				boost: 75,
				wildcard: lunr.Query.wildcard.TRAILING,
			})
			q.term(word, {
				fields: ['name', 'tinyName'],
				boost: 50,
				wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING,
			})
			q.term(word, {
				fields: ['name', 'tinyName'],
				boost: 25,
				editDistance: 1,
			})
			q.term(word, {
				fields: ['name', 'tinyName'],
				boost: 10,
				editDistance: 2,
			})
			q.term(word, {
				fields: ['name', 'tinyName'],
				boost: 1,
				editDistance: 3,
			})
		})
	})
	results.splice(20)
	return results.map(v => v.ref)
})


