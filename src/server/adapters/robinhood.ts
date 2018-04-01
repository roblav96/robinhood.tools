// 
export * from '../../common/robinhood'
// 

import * as _ from 'lodash'
import * as robinhood from '../../common/robinhood'
import * as http from './http'
import * as redis from './redis'



export async function getSymbols() {
	let resolved = await redis.main.get(redis.RH.SYMBOLS + ':' + process.INSTANCE)
	console.log('resolved ->', resolved)
	return JSON.parse(resolved) as string[]
}




