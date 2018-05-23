// 

import '../main'
import * as lunr from 'lunr'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as utils from '../adapters/utils'



let index = lunr(_.noop)

// pandora.on('symbols.reset', onSymbols)
// pandora.once('symbols.ready', onSymbols)
// pandora.broadcast({}, 'symbols.start')

pandora.on('quotes.ready', _.debounce(onReady, 1000, { leading: false, trailing: true }))
async function onReady(hubmsg: Pandora.HubMessage) {
	console.log(`hubmsg ->`, hubmsg.action)
	return

	let symbols = await utils.getSymbols()

	symbols.splice(10)

	let ikeys = ['companyName', 'description', 'symbol'] as KeysOf<Iex.Item>
	let coms = symbols.map(v => ['hmget', `${rkeys.IEX.ITEMS}:${v}`].concat(ikeys))
	let resolved = await redis.main.coms(coms)
	resolved = resolved.map(v => redis.fixHmget(v, ikeys))

	console.log(`resolved ->`, resolved)



}





