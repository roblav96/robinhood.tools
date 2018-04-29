// 



import * as pms from 'pretty-ms'
export function ms(ms: number) {
	return pms(ms)
}

import * as pbytes from 'pretty-bytes'
export function bytes(bytes: number) {
	return pbytes(bytes)
}



import * as humanize from 'humanize-plus'
export function plural(input: string, value: number) {
	return humanize.pluralize(value, input)
}
export function formatNumber(value: any, precision = 0) {
	let formatted = !isNaN(value) && humanize.formatNumber(value, precision)
	if (formatted) return formatted;
	let unit = value.replace(/[0-9.]/g, '')
	return humanize.formatNumber(Number.parseFloat(value), precision) + unit
}


