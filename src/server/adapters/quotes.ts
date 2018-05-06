// 

export * from '../../common/quotes'
import * as quotes from '../../common/quotes'
import * as core from '../../common/core'
import * as rkeys from '../../common/rkeys'
import * as pandora from './pandora'
import * as redis from './redis'
import * as socket from './socket'
import * as stocks from './stocks'
import * as webull from './webull'



export const QUOTES = [] as Quote[]

export async function onsymbols(fsymbols: Dict<number>) {
	let symbols = Object.keys(fsymbols)
	symbols.splice(10)
	let coms = [] as Redis.Coms
	symbols.forEach(function(v) {
		coms.push(['hgetall', `${rkeys.RH.INSTRUMENTS}:${v}`])
		coms.push(['hgetall', `${rkeys.WB.TICKERS}:${v}`])
		coms.push(['hgetall', `${rkeys.WB.QUOTES}:${v}`])
	})
	let resolved = await redis.main.coms(coms)
	resolved.forEach(core.fix)

	QUOTES.splice(0)

	let ii = 0
	symbols.forEach(function(symbol, i) {
		let instrument = resolved[ii++] as Robinhood.Instrument
		let wbticker = resolved[ii++] as Webull.Ticker
		let wbquote = resolved[ii++] as Webull.Quote
	})

}


