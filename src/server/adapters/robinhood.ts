// 
export * from '../../common/robinhood'
// 

import * as robinhood from '../../common/robinhood'
import * as http from './http'
import * as redis from './redis'



export async function getAllSymbols() {
	let resolved = await redis.main.smembers(`${redis.RH.SYMBOLS}`) as string[]
	return resolved.sort()
}

export async function getSymbols() {
	let resolved = await redis.main.get(`${redis.RH.SYMBOLS}:${process.env.INSTANCES}:${process.env.INSTANCE}`)
	return (resolved ? resolved.split(',') : []) as string[]
}




