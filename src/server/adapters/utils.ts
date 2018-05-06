// 

import * as core from '../../common/core'
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



// export function iMs(ms: number) {
// 	return core.math.dispersed(ms, process.env.INSTANCE, process.env.SCALE)
// }





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




