// 

import '../main'
import * as lunr from 'lunr'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as utils from '../adapters/utils'



let idx = lunr(_.noop)

pandora.once('symbols.ready', onready)
pandora.broadcast({}, 'symbols.start')

pandora.on('quotes.ready', _.debounce(onready, 1000, { leading: false, trailing: true }))
async function onready(hubmsg: Pandora.HubMessage) {
	console.log(`hubmsg ->`, hubmsg.action)

	let symbols = (await redis.main.keys(`${rkeys.QUOTES}:*`)).map(v => v.split(':').pop())

	let ikeys = ['symbol', 'name', 'description'] as KeysOf<Iex.Item>
	let quotes = (await redis.main.coms(symbols.map(v => {
		return ['hmget', `${rkeys.QUOTES}:${v}`].concat(ikeys)
	}))).map(v => redis.fixHmget(v, ikeys)) as Quotes.Quote[]

	idx = lunr(function() {
		this.ref('symbol')
		this.field('symbol', { boost: 100 })
		this.field('name', { boost: 5 })
		this.field('description')
		this.metadataWhitelist = ['position']
		quotes.forEach(v => this.add(v))
	})

	onquery({ data: 'amd' } as any)

}



pandora.on('search.query', onquery)
function onquery(hubmsg: Pandora.HubMessage) {
	console.log(`hubmsg ->`, hubmsg)
	let query = hubmsg.data as string
	console.time(query)
	let results = idx.search(`${query}~1`)
	console.timeEnd(query)
	console.log('results ->', results)
	if (!hubmsg.host) return;
	pandora.send({ clientId: hubmsg.host.clientId }, 'search.results', results)
}


