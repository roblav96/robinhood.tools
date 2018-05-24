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



// let searchindex: lunr.Index
let searchindex: any

pandora.once('symbols.ready', onready)
pandora.broadcast({}, 'symbols.start')
// pandora.on('quotes.ready', _.debounce(onready, 1000, { leading: false, trailing: true }))

async function onready(hubmsg: Pandora.HubMessage) {
	console.log(`hubmsg ->`, hubmsg.action)

	let symbols = (await redis.main.keys(`${rkeys.QUOTES}:*`)).map(v => v.split(':').pop())

	let ikeys = ['symbol', 'name', 'description'] as KeysOf<Quotes.Quote>
	let quotes = (await redis.main.coms(symbols.map(v => {
		return ['hmget', `${rkeys.QUOTES}:${v}`].concat(ikeys)
	}))).map(v => redis.fixHmget(v, ikeys)) as Quotes.Quote[]

	// quotes.splice(10)

	console.time(`Wade`)
	let searchsymbols = Wade(quotes.map(v => v.symbol))
	console.log(`searchsymbols -> %O`, searchsymbols, searchsymbols)
	let searchnames = Wade(quotes.map(v => v.name))
	let searchdescriptions = Wade(quotes.map(v => v.description))
	// console.log('search ->', search)
	let index = Wade.save(search)
	// console.log('index ->', index)
	console.timeEnd(`Wade`)

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


