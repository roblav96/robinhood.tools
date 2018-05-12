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
import * as Wbquotes from './wb.quotes.service'



Wbquotes.emitter.on('symbols', onSymbols)
async function onSymbols(hubdata: SymbolsHubData, dwbquotes: Dict<Webull.Quote>) {
	let wbquotes = Object.keys(dwbquotes).map(k => dwbquotes[k])
}



Wbquotes.emitter.on('data', function(topic: number, wbquote: Webull.Quote) {

})

Wbquotes.emitter.on('toquote', function(topic: number, wbquote: Webull.Quote) {

})


