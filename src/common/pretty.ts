// 

import * as prettyms from 'pretty-ms'
import * as prettybytes from 'pretty-bytes'
import * as humanize from 'humanize-plus'
import * as webull from './webull'
import dayjs from './dayjs'



export function ms(ms: number) { return prettyms(ms) }
export function bytes(bytes: number) { return prettybytes(bytes) }

export function plural(value: string, count: number) {
	return humanize.pluralize(count, value)
}



export function stamp(stamp = Date.now(), format = 'dddd, MMM DD YYYY, hh:mm:ssa') {
	return dayjs(stamp).format(format)
}

declare global { interface FromNowOpts extends prettyms.PrettyMsOptions { max: number, keepDecimalsOnWholeSeconds: boolean } }
export function fromNow(stamp: number, opts = {} as Partial<FromNowOpts>) {
	opts.secDecimalDigits = opts.secDecimalDigits || 0
	opts.max = opts.max || 2
	let ms = prettyms(Math.max(Date.now() - stamp, 1000), opts)
	if (Number.isFinite(opts.max)) {
		ms = ms.split(' ').splice(0, opts.verbose ? opts.max * 2 : opts.max).join(' ')
	}
	return ms + ' ago'
}



declare global { interface NFixedOpts { precision: number, compact: boolean, plusminus: boolean, percent: boolean } }
export function nfixed(value: number, { precision, compact, plusminus, percent } = {} as Partial<NFixedOpts>) {
	if (!value) return value;
	if (!Number.isFinite(precision)) {
		precision = 2
		let abs = Math.abs(value)
		if (abs < 3) precision = 3;
		if (abs >= 1000) precision = 1;
		if (abs >= 10000) precision = 0;
	}
	if (percent || plusminus) precision = Math.min(precision, 2)
	let fixed = value.toFixed(precision)
	if (compact && precision == 0) {
		let units = ['', 'k', 'M', 'T']
		let ii = 0
		let i: number, len = units.length
		for (i = 0; i < len; i++) {
			if (value / 1000 >= 1) {
				value = value / 1000
				ii++
			}
		}
		fixed = value.toFixed(0) + units[ii]
	}
	if (plusminus && value > 0) fixed = '+' + fixed;
	if (plusminus && value < 0) fixed = fixed.replace('-', '–');
	if (percent) fixed += '%';
	return fixed
}

export function formatNumber(value: any, precision = 0) {
	let formatted = !isNaN(value) && humanize.formatNumber(value, precision)
	if (formatted) return formatted;
	let unit = value.replace(/[0-9.]/g, '').trim()
	unit = ' ' + unit
	return humanize.formatNumber(Number.parseFloat(value), precision) + unit
}



export function marketState(state: Hours.State) {
	if (state == 'REGULAR') return 'Markets Open';
	if (state.includes('PRE')) return 'Pre Market';
	if (state.includes('POST')) return 'After Hours';
	return 'Markets Closed'
}


