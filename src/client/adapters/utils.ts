// 

import * as prettyms from 'pretty-ms'
import * as _ from '@/common/lodash'
import * as core from '@/common/core'
import Emitter from '@/common/emitter'



export const emitter = new Emitter()



const UNITS = ['K', 'M', 'B', 'T']
declare global { interface VNumberOpts { precision: number, compact: boolean, plusminus: boolean, percent: boolean, dollar: boolean, nozeros: boolean } }
export function vnumber(value: number, { precision, compact, plusminus, percent, dollar, nozeros } = {} as Partial<VNumberOpts>) {
	if (!Number.isFinite(precision)) {
		if (compact) precision = 0;
		else {
			precision = 2
			let abs = Math.abs(value)
			if (compact === undefined && abs >= 10000) compact = true;
			else if (abs >= 10000) precision = 0;
			else if (abs >= 2000) precision = 1;
			else if (abs < 3) precision = 3;
			// if (plusminus && abs >= 1) precision = Math.min(precision, 2);
		}
	} else { nozeros = false }
	if (plusminus || percent) precision = Math.min(precision, 2);

	let unit = -1
	if (compact) {
		while (value >= 1000) { value = value / 1000; unit++ }
	}

	let split = value.toString().split('.')
	let int = split[0]
	let fixed = int.slice(-3)
	{
		let n: number, i = 1
		for (n = 1000; n <= value; n *= 1000) {
			let from = i * 3
			i++
			let to = i * 3
			fixed = int.slice(-to, -from) + ',' + fixed
		}
	}

	if (precision > 0 && !(compact && unit == -1)) {
		let end = split[1] || ''
		if (!nozeros || !Number.isNaN(Number.parseInt(end))) {
			fixed += '.'
			let i: number, len = precision
			for (i = 0; i < len; i++) {
				fixed += end[i] || '0'
			}
		}
	}

	if (compact) fixed += UNITS[unit] || '';

	let cash = dollar ? '$' : ''
	if (plusminus && value > 0) {
		fixed = '+' + cash + fixed
	}
	else if (plusminus && value < 0) {
		fixed = fixed.substr(1)
		fixed = '–' + cash + fixed
	}
	else { fixed = cash + fixed };
	if (percent) fixed += '%';

	return fixed
}
if (process.env.DEVELOPMENT) Object.assign(window, { vnumber });



declare global { interface VFromNowOpts extends prettyms.PrettyMsOptions { max: number, keepDecimalsOnWholeSeconds: boolean } }
export function vfromnow(stamp: number, opts = {} as Partial<VFromNowOpts>) {
	if (!Number.isFinite(opts.secDecimalDigits)) opts.secDecimalDigits = 0;
	if (!Number.isFinite(opts.max)) opts.max = 1;
	let ms = prettyms(Math.max(Date.now() - stamp, 1001), opts)
	ms = ms.split(' ').splice(0, opts.verbose ? opts.max * 2 : opts.max).join(' ')
	return ms + ' ago'
}



export function bidask(quote: Quotes.Quote) {
	let bidask = { bid: { price: 0, size: 0 }, ask: { price: 0, size: 0 } }
	if (Object.keys(quote).length == 0) return bidask;
	{
		let max = quote.ask - quote.bid
		bidask.bid.price = core.calc.slider(quote.price - quote.bid, 0, max)
		bidask.ask.price = core.calc.slider(quote.ask - quote.price, 0, max)
	}
	{
		let max = quote.bids + quote.asks
		bidask.bid.size = core.calc.slider(quote.bids, 0, max)
		bidask.ask.size = core.calc.slider(quote.asks, 0, max)
	}
	return bidask
}



export function randomPrice(price: number) {
	return _.round(price + _.random(-1, 1, true), 2)
}



export function marketState(state: Hours.State) {
	if (!state) return state;
	if (state == 'REGULAR') return 'Markets Open';
	if (state.includes('PRE')) return 'Pre Market';
	if (state.includes('POST')) return 'After Hours';
	return 'Markets Closed'
}

export function marketcapCategory(marketcap: number) {
	if (marketcap > (100 * 1000 * 1000 * 1000)) return 'mega';
	if (marketcap > (10 * 1000 * 1000 * 1000)) return 'large';
	if (marketcap > (2 * 1000 * 1000 * 1000)) return 'mid';
	if (marketcap > (300 * 1000 * 1000)) return 'small';
	if (marketcap > (50 * 1000 * 1000)) return 'micro';
	return 'nano'
}







