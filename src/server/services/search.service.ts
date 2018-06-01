// 

import '../main'
import * as lunr from 'lunr'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as utils from '../adapters/utils'
import radio from '../adapters/radio'



let INDEX = lunr(_.noop)

radio.once('symbols.ready', onready)
radio.emit('symbols.start')

async function onready() {

	let keys = await redis.main.keys(`${rkeys.QUOTES}:*`)
	let ikeys = ['symbol', 'name'] as KeysOf<Quotes.Quote>
	let quotes = (await redis.main.coms(keys.map(key => {
		return ['hmget', key].concat(ikeys)
	}))).map((v: Quotes.Quote) => {
		v = redis.fixHmget(v, ikeys)
		v.symbol = v.symbol.toLowerCase()
		v.name = core.string.clean(v.name).toLowerCase()
		return v
	})

	let builder = new lunr.Builder()
	builder.metadataWhitelist = ['position']
	builder.ref('symbol')
	builder.field('symbol')
	builder.field('name')
	quotes.forEach(builder.add, builder)
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


