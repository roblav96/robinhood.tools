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



const QUOTES = [] as Quotes.Quote[]
const WADES = { symbol: null, name: null, description: null }

pandora.once('symbols.ready', onready)
pandora.broadcast({}, 'symbols.start')
// pandora.on('quotes.ready', _.debounce(onready, 1000, { leading: false, trailing: true }))

async function onready(hubmsg: Pandora.HubMessage) {

	let ikeys = ['symbol', 'name', 'description', 'avgVolume'] as KeysOf<Quotes.Quote>
	let keys = await redis.main.keys(`${rkeys.QUOTES}:*`)
	let quotes = (await redis.main.coms(keys.map(key => {
		return ['hmget', key].concat(ikeys)
	}))).map((v: Quotes.Quote) => {
		v = redis.fixHmget(v, ikeys)
		core.fix(v)
		return v
	})
	// .sort((a, b) => core.sort.alphabetically(a.symbol, b.symbol))

	QUOTES.splice(0, Infinity, ...quotes.map(v => ({
		symbol: v.symbol,
		avgVolume: v.avgVolume || 0,
	} as Quotes.Quote)))

	let symbols = quotes.map(v => v.symbol)
	Wade.config.stopWords.remove(v => symbols.includes(v.toUpperCase()))

	Object.keys(WADES).forEach(key => {
		WADES[key] = Wade.save(Wade(quotes.map(v => v[key] || '')))
	})

	// onquery({ data: 'am' } as any)



	// let isymbols = Wade(INDEXES.symbols)(query).map(meta => meta.index)
	// console.log('isymbols ->', isymbols)
	// let inames = Wade(INDEXES.names)(query).map(meta => meta.index)
	// console.log('inames ->', inames)
	// let idescriptions = Wade(INDEXES.descriptions)(query).map(meta => meta.index)
	// console.log('idescriptions ->', idescriptions)


	// let indexes = isymbols.concat(inames).concat(idescriptions)
	// console.log('indexes ->', indexes)
	// let uniqs = _.uniq(isymbols.concat(inames).concat(idescriptions))
	// console.log(`uniqs ->`, uniqs)

	// return
	// console.log(`symbols ->`, symbols)
	// let search = Wade(INDEXES.names)
	// let metas = search('Powell')
	// console.log('metas ->', metas)
	// let results = metas.map(meta => QUOTES[meta.index])
	// console.log('results ->', results)



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



const MAX = 20
pandora.on('search.query', onquery)
async function onquery(hubmsg: Pandora.HubMessage) {
	let query = hubmsg.data as string

	let symbols = [] as string[]
	Object.keys(WADES).forEach(key => {
		if (symbols.length > MAX) return;
		let quotes = Wade(WADES[key])(query).map(({ index }) => QUOTES[index]) as Quotes.Quote[]
		quotes.sort((a, b) => b.avgVolume - a.avgVolume).forEach(({ symbol }) => {
			if (symbols.includes(symbol)) return;
			if (symbols.length >= MAX) return;
			symbols.push(symbol)
		})
	})

	if (!hubmsg.host) return;
	pandora.send({ clientId: hubmsg.host.clientId }, 'search.results', symbols)



	// // let results = searchindex.search(`symbol:${query} ${query}~1`)
	// // let results = searchindex.search(query)

	// let results = searchindex.query(function(q) {
	// 	// q.clause({ boost: 10, fields: ['symbol'] })
	// 	q.term(query, { fields: ['symbol'] })
	// 	// q.term(query, { fields: ['symbol'], boost: 1, editDistance: 1 })
	// 	// q.term(query, { fields: ['name'], boost: 5, editDistance: 1 })
	// 	// q.term(query, { editDistance: 1 })
	// 	// return q.term(query, { boost: 100, usePipeline: true })
	// 	// q.term(query, { boost: 10, usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING })
	// 	// q.term(query, { boost: 1, editDistance: 1 })
	// })

	// results.splice(9)
	// console.log('results ->', results)

	// if (!hubmsg.host) return;
	// pandora.send({ clientId: hubmsg.host.clientId }, 'search.results', results)

}


