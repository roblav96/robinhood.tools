// 

import '../main'
import * as lunr from 'lunr'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as utils from '../adapters/utils'



pandora.on('symbols.reset', onSymbols)
pandora.once('symbols.ready', onSymbols)
pandora.broadcast({}, 'symbols.starts')

async function onSymbols(hubmsg: Pandora.HubMessage) {
	// console.log(`hubmsg ->`, hubmsg)
	
	let symbols = await utils.getSymbols()
	
}





