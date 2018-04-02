// 
export * from '../../common/robinhood'
// 

import * as core from '../../common/core'
import * as robinhood from '../../common/robinhood'
import * as http from './http'
import * as redis from './redis'



export async function getAllSymbols() {
	let resolved = await redis.main.get(`${redis.RH.SYMBOLS}:${process.INSTANCES}`)
	return !resolved ? [] : JSON.parse(resolved) as string[]
}

export async function getSymbols(i = process.INSTANCE) {
	let resolved = await redis.main.get(`${redis.RH.SYMBOLS}:${process.INSTANCES}:${process.INSTANCE}`)
	return !resolved ? [] : JSON.parse(resolved) as string[]
}



async function getInstruments(url: string) {
	let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
	// if (_.isEmpty(response)) return;
	// response.results.forEach(v => core.fix(v))
	console.log('response.results ->', response.results)
	return response
}




