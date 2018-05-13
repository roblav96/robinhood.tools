// 

import * as pAll from 'p-all'
import * as schedule from 'node-schedule'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as hours from '../adapters/hours'
import * as socket from '../adapters/socket'
import * as utils from '../adapters/utils'
import * as webull from '../adapters/webull'
import * as http from '../adapters/http'
import * as wbservice from './wb.quotes.service'



wbservice.emitter.on('onSymbols', onSymbols)
async function onSymbols(hubmsg: Pandora.HubMessage, dwbquotes: Dict<Webull.Quote>) {
	let reset = hubmsg.action == 'symbols.reset'
	let wbquotes = Object.keys(dwbquotes).map(k => dwbquotes[k])
	
	
}



wbservice.emitter.on('data', function(topic: number, wbquote: Webull.Quote) {

})

wbservice.emitter.on('toquote', function(topic: number, wbquote: Webull.Quote) {

})


