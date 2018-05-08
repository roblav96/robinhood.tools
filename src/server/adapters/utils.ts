// 

import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as redis from './redis'



export const devfsymbols = {
	SPY: 913243251,
	BABA: 913254558,
	BAC: 913254999,
	AAPL: 913256135,
	AMD: 913254235,
	// FB: 913303928,
	// INTC: 913257268,
	// MSFT: 913323997,
	// GE: 913255327,
	// MU: 913324077,
	// SQ: 913254798,
	// ROKU: 925376726,
	// XNET: 913255889,
	// DPW: 913303773,
	// LFIN: 925401791,
	// PXS: 913253601,
	// ASTC: 913254169,
	// CADC: 913254240,
	// CHFS: 913253381,
	// LEDS: 913253344,
	// CREG: 913254265,
	// ISZE: 913247275,
	// WEXP: 913246860,
	// GMFL: 925348033,
} as Dict<number>



export async function getSymbols(type: keyof typeof rkeys.SYMBOLS) {
	let resolved = await redis.main.get(rkeys.SYMBOLS[type])
	return (resolved ? JSON.parse(resolved) : []) as string[]
}
export async function getInstanceSymbols(type: keyof typeof rkeys.SYMBOLS) {
	let resolved = await redis.main.get(`${rkeys.SYMBOLS[type]}:${process.env.CPUS}:${process.env.INSTANCE}`)
	return (resolved ? JSON.parse(resolved) : []) as string[]
}

export async function getFullSymbols(type: keyof typeof rkeys.FSYMBOLS) {
	let resolved = await redis.main.get(rkeys.FSYMBOLS[type])
	return (resolved ? JSON.parse(resolved) : {}) as Dict<number>
}
export async function getInstanceFullSymbols(type: keyof typeof rkeys.FSYMBOLS) {
	let resolved = await redis.main.get(`${rkeys.FSYMBOLS[type]}:${process.env.CPUS}:${process.env.INSTANCE}`)
	return (resolved ? JSON.parse(resolved) : {}) as Dict<number>
}



import * as fs from 'fs'
import * as path from 'path'
import * as sourcemaps from 'source-map-support'
/**▶ utils.requireDir(__dirname, __filename) */
export function requireDir(dirName: string, fileName: string) {
	fs.readdirSync(dirName).filter(v => v != fileName).forEach(function(file) {
		let full = path.join(dirName, file)
		let src = sourcemaps.retrieveSourceMap(full).url
		src = src.replace('/dist/', '/src/').replace('.js', '.ts')
		if (!fs.existsSync(src)) return;
		require(full)
	})
}




