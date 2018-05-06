// 

import * as rkeys from '../../common/rkeys'
import * as redis from './redis'



export async function getAllSymbols() {
	return JSON.parse(await redis.main.get(rkeys.STOCKS.SYMBOLS)) as string[]
}
export async function getSymbols() {
	let resolved = await redis.main.get(`${rkeys.STOCKS.SYMBOLS}:${process.env.CPUS}:${process.env.INSTANCE}`)
	return JSON.parse(resolved) as string[]
}

export async function getAllFullSymbols() {
	return JSON.parse(await redis.main.get(rkeys.STOCKS.FSYMBOLS)) as Dict<number>
}
export async function getFullSymbols() {
	let resolved = await redis.main.get(`${rkeys.STOCKS.FSYMBOLS}:${process.env.CPUS}:${process.env.INSTANCE}`)
	return JSON.parse(resolved) as Dict<number>
}

