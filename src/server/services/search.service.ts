// 

import '../main'
import * as lunr from 'lunr'
import * as Wade from 'wade'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from '../adapters/redis'
import * as utils from '../adapters/utils'
import radio from '../adapters/radio'



const QUOTES = [] as Quotes.Quote[]
const WADES = { symbol: null, name: null }

radio.once('symbols.ready', onready)
radio.emit('symbols.start')
async function onready() {

	let keys = await redis.main.keys(`${rkeys.QUOTES}:*`)
	let ikeys = ['symbol', 'name', 'avgVolume'] as KeysOf<Quotes.Quote>
	let quotes = (await redis.main.coms(keys.map(key => {
		return ['hmget', key].concat(ikeys)
	}))).map((v: Quotes.Quote) => {
		v = redis.fixHmget(v, ikeys)
		core.fix(v)
		return v
	})

	core.nullify(QUOTES)
	QUOTES.push(...quotes.map(v => ({
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
radio.reply('search.query', async function onquery(query: string) {
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
	return symbols
})


