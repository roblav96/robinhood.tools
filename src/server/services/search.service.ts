// 

import '../main'
import * as lunr from 'lunr'
import * as schedule from 'node-schedule'
import * as rkeys from '../../common/rkeys'
import * as pretty from '../../common/pretty'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as http from '../adapters/http'
import * as socket from '../adapters/socket'
import * as hours from '../adapters/hours'



pandora.on('symbols.reset', onSymbols)
pandora.once('symbols.ready', onSymbols)
pandora.broadcast({}, 'symbols.start')

async function onSymbols(hubmsg: Pandora.HubMessage) {
	console.log(`hubmsg ->`, hubmsg)
}





