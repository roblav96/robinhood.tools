// 
export * from '../../common/robinhood'
// 

import * as robinhood from '../../common/robinhood'
import * as http from './http'
import * as redis from './redis'
import * as os from 'os'



export async function getAllSymbols() {
	let resolved = await redis.main.smembers(`${redis.RH.SYMBOLS}`) as string[]
	return resolved.sort()
}

export async function getSymbols() {
	let resolved = await redis.main.get(`${redis.RH.SYMBOLS}:${process.env.CPUS}:${process.env.INSTANCE}`)
	return (resolved ? resolved.split(',') : []) as string[]
}




