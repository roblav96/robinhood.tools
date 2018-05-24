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



const CACHE = [] as Quotes.Quote[]
const WADES = { symbol: null, name: null, description: null }

const onready = _.debounce(_onready, 3000, { leading: false, trailing: true })
pandora.once('symbols.ready', onready)
pandora.broadcast({}, 'symbols.start')
pandora.on('quotes.ready', onready)

async function _onready(hubmsg: Pandora.HubMessage) {

	let keys = await redis.main.keys(`${rkeys.QUOTES}:*`)
	let ikeys = ['symbol', 'name', 'description', 'avgVolume'] as KeysOf<Quotes.Quote>
	let quotes = (await redis.main.coms(keys.map(key => {
		return ['hmget', key].concat(ikeys)
	}))).map((v: Quotes.Quote) => {
		v = redis.fixHmget(v, ikeys)
		core.fix(v)
		return v
	})

	core.nullify(CACHE)
	CACHE.push(...quotes.map(v => ({
		symbol: v.symbol,
		avgVolume: v.avgVolume || 0,
	} as Quotes.Quote)))

	let symbols = quotes.map(v => v.symbol)
	Wade.config.stopWords.remove(v => symbols.includes(v.toUpperCase()))

	Object.keys(WADES).forEach(key => {
		core.nullify(WADES[key])
		WADES[key] = Wade.save(Wade(quotes.map(v => v[key] || '')))
	})

}



const MAX = 20
pandora.reply('search.query', async function onquery(query: string) {
	let symbols = [] as string[]
	Object.keys(WADES).forEach(key => {
		if (symbols.length > MAX) return;
		let quotes = Wade(WADES[key])(query).map(({ index }) => CACHE[index]) as Quotes.Quote[]
		quotes.sort((a, b) => b.avgVolume - a.avgVolume).forEach(({ symbol }) => {
			if (symbols.includes(symbol)) return;
			if (symbols.length >= MAX) return;
			symbols.push(symbol)
		})
	})
	return symbols
})


