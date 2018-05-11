// 

import * as pAll from 'p-all'
import * as _ from '../../common/lodash'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as schedule from 'node-schedule'
import * as pandora from '../adapters/pandora'
import * as redis from '../adapters/redis'
import * as hours from '../adapters/hours'
import * as socket from '../adapters/socket'
import * as utils from '../adapters/utils'
import * as webull from '../adapters/webull'
import * as http from '../adapters/http'
import Emitter from '../../common/emitter'
import clock from '../../common/clock'
import emitter from './wb.quotes.service'



emitter.on('onSymbols', function(hubdata: Symbols.OnSymbolsData, wbquotes: Dict<Webull.Quote>) {
	
})

emitter.on('data', function(topic: number, wbquote: Webull.Quote) {

})

emitter.on('toquote', function(topic: number, wbquote: Webull.Quote) {

})


