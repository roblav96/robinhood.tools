// 
export * from '../../common/robinhood'
// 

import * as _ from 'lodash'
import * as core from '../../common/core'
import * as robinhood from '../../common/robinhood'
import * as http from './http'
import * as redis from './redis'



export async function getAllSymbols() {
	let resolved = await redis.main.get(`${redis.RH.SYMBOLS}`)
	return (resolved ? JSON.parse(resolved) : []) as string[]
}

export async function getSymbols(i = process.INSTANCE) {
	let resolved = await redis.main.get(`${redis.RH.SYMBOLS}:${process.INSTANCES}:${process.INSTANCE}`)
	return (resolved ? JSON.parse(resolved) : []) as string[]
}



export async function getInstruments(url: string) {
	let response = await http.get(url) as Robinhood.API.Paginated<Robinhood.Instrument>
	// if (!response) return;
	_.remove(response.results, v => v.symbol.match(/\W+/))
	response.results.forEach(v => core.fix(v))
	return response
}




