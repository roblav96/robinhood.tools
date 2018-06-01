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
		all.quote.symbol = all.symbol
		builder.add(all.quote)
	})
	INDEX = builder.build()

}



const MAX = 20
radio.reply('search.query', async function onquery(query: string) {
	let results = INDEX.query(function(q) {
		q.term(query, {
			fields: ['symbol'],
			boost: 100000,
		})
		q.term(`${query}*`, {
			fields: ['symbol'],
			boost: 10000,
		})
		q.term(`*${query}*`, {
			fields: ['symbol'],
			boost: 1000,
		})
		q.term(`*${query}*`, {
			fields: ['name'],
			boost: 100,
		})
		q.term(query, {
			fields: ['symbol'],
			boost: 10,
			editDistance: 1,
		})
		q.term(query, {
			fields: ['name'],
			boost: 1,
			editDistance: 2,
		})
	})
	results.splice(MAX)
	return results.map(v => v.ref.toUpperCase())
})


