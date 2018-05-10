// 

import * as pms from 'pretty-ms'
import * as pbytes from 'pretty-bytes'
import * as humanize from 'humanize-plus'
import dayjs from './dayjs'



export function ms(ms: number) { return pms(ms) }
export function bytes(bytes: number) { return pbytes(bytes) }

export function plural(value: string, count: number) {
	return humanize.pluralize(count, value)
}

export function formatNumber(value: any, precision = 0) {
	let formatted = !isNaN(value) && humanize.formatNumber(value, precision)
	if (formatted) return formatted;
	let unit = value.replace(/[0-9.]/g, '').trim()
	// if (unit.toUpperCase() == unit) unit = ' ' + unit;
	unit = ' ' + unit
	return humanize.formatNumber(Number.parseFloat(value), precision) + unit
}

export function stamp(stamp = Date.now(), format = 'dddd, MMM DD YYYY, hh:mm:ssa') {
	return dayjs(stamp).format(format)
}

export function marketState(state: Hours.State) {
	if (state == 'REGULAR') return 'Markets Open';
	if (state.includes('PRE')) return 'Pre-Market';
	if (state.includes('POST')) return 'After-Hours';
	return 'Markets Closed'
}


