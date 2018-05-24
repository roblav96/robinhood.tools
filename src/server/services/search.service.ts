// 

import '../main'
import * as lunr from 'lunr'
import * as Wade from 'wade'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as utils from '../adapters/utils'



// let QUOTES = [] as Quotes.Quote[]
let INDEXES = { symbols: null, names: null, descriptions: null }

pandora.once('symbols.ready', onready)
pandora.broadcast({}, 'symbols.start')
// pandora.on('quotes.ready', _.debounce(onready, 1000, { leading: false, trailing: true }))

async function onready(hubmsg: Pandora.HubMessage) {
	console.log(`hubmsg ->`, hubmsg.action)

	let ikeys = ['symbol', 'name', 'description', 'avgVolume'] as KeysOf<Quotes.Quote>
	let keys = await redis.main.keys(`${rkeys.QUOTES}:*`)
	let quotes = (await redis.main.coms(keys.map(key => {
		return ['hmget', key].concat(ikeys)
	}))).map((v: Quotes.Quote) => {
		v = redis.fixHmget(v, ikeys)
		core.fix(v)
		return v
	})

	let symbols = quotes.map(quote => {
		if (!quote.symbol || !quote.symbol.toLowerCase) {
			console.warn(`quote ->`, quote)
		}
		return quote.symbol.toLowerCase()
	})
	console.log(`symbols ->`, symbols)
	return
	// INDEXES.symbols = Wade.save(Wade())
	// INDEXES.names = Wade.save(Wade(QUOTES.map(v => v.name || '')))
	// INDEXES.descriptions = Wade.save(Wade(QUOTES.map(v => v.description || '')))

	console.log(`symbols ->`, symbols)
	// let search = Wade(symbols)
	// console.log('search ->', search)
	return

	let metas = search('all')
	console.log('metas ->', metas)
	let results = metas.map(meta => QUOTES[meta.index])
	console.log('results ->', results)




	// quotes = quotes.map(quote => _.mapValues(quote, (v: string, k) => {
	// 	return v.toLowerCase()
	// })) as any

	// let builder = new lunr.Builder()
	// builder.ref('symbol')
	// searchindex = builder.build()

	// searchindex = lunr(function() {
	// 	this.ref('symbol')
	// 	this.field('symbol')
	// 	this.field('name')
	// 	this.field('description')
	// 	// this.metadataWhitelist = ['position']
	// 	quotes.forEach(v => this.add(v))
	// })

	// onquery({ data: 'nv' } as any)

}



pandora.on('search.query', onquery)
function onquery(hubmsg: Pandora.HubMessage) {
	let query = hubmsg.data as string
	console.log(`query ->`, query)

	// let results = searchindex.search(`symbol:${query} ${query}~1`)
	// let results = searchindex.search(query)

	let results = searchindex.query(function(q) {
		// q.clause({ boost: 10, fields: ['symbol'] })
		q.term(query, { fields: ['symbol'] })
		// q.term(query, { fields: ['symbol'], boost: 1, editDistance: 1 })
		// q.term(query, { fields: ['name'], boost: 5, editDistance: 1 })
		// q.term(query, { editDistance: 1 })
		// return q.term(query, { boost: 100, usePipeline: true })
		// q.term(query, { boost: 10, usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING })
		// q.term(query, { boost: 1, editDistance: 1 })
	})

	results.splice(9)
	console.log('results ->', results)

	if (!hubmsg.host) return;
	pandora.send({ clientId: hubmsg.host.clientId }, 'search.results', results)
}


