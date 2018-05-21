// 

import * as prettyms from 'pretty-ms'
import * as prettybytes from 'pretty-bytes'
import * as humanize from 'humanize-plus'
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
	// let ms = prettyms(Date.now() - stamp, opts)
	let ms = prettyms(Math.max(Date.now() - stamp, 1000), opts)
	if (Number.isFinite(opts.max)) {
		ms = ms.split(' ').splice(0, opts.verbose ? opts.max * 2 : opts.max).join(' ')
	}
	return ms + ' ago'
}

export function formatNumber(value: any, precision = 0) {
	let formatted = !isNaN(value) && humanize.formatNumber(value, precision)
	if (formatted) return formatted;
	let unit = value.replace(/[0-9.]/g, '').trim()
	unit = ' ' + unit
	return humanize.formatNumber(Number.parseFloat(value), precision) + unit
}


