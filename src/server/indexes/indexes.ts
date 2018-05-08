// 

import '../main'
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
import clock from '../../common/clock'



async function readyIndexes() {
	let exists = await redis.main.exists(rkeys.INDEXES.SYMBOLS) as number
	if (exists == 0) await syncIndexes(core.clone(webull.indexes));
}
readyIndexes().catch(function(error) {
	console.error('readyIndexes Error ->', error)
})

async function syncIndexes(symbols: string[]) {
	let url = 'https://securitiesapi.webull.com/api/securities/market/tabs/v2/globalIndices/1'
	let list = await http.get(url, { query: { hl: 'en' } }) as Webull.Api.MarketIndexList

}


