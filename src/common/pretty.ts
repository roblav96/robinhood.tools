// 

import * as _ from './lodash'
import * as core from './core'
import * as prettyms from 'pretty-ms'
import * as prettybytes from 'pretty-bytes'
import * as humanize from 'humanize-plus'
import * as dayjs from 'dayjs'



export function ms(ms: number, opts = {} as prettyms.PrettyMsOptions) { return prettyms(ms, opts) }
export function bytes(bytes: number) { return prettybytes(bytes) }

export function plural(value: string, count: number) {
	return humanize.pluralize(count, value)
}

export function stamp(stamp = Date.now(), format = 'dddd, MMM DD YYYY, hh:mm:ssa') {
	return dayjs(stamp).format(format)
}

export function formatNumber(value: any, precision = 0) {
	let formatted = !isNaN(value) && humanize.formatNumber(value, precision)
	if (formatted) return formatted;
	let unit = value.replace(/[0-9.]/g, '').trim()
	unit = ' ' + unit
	return humanize.formatNumber(Number.parseFloat(value), precision) + unit
}

const COMPANY_STOPWORDS = ['co', 'company', 'corp', 'corporation', 'inc', 'ltd', 'the']
export function company(company: string) {
	let split = company.split(' ')
	let first = split[0].toLowerCase().replace(/[^a-z]+/g, '')
	if (COMPANY_STOPWORDS.includes(first)) split.shift();
	let last = split[split.length - 1].toLowerCase().replace(/[^a-z]+/g, '')
	if (COMPANY_STOPWORDS.includes(last)) split.pop();
	return _.truncate(split.join(' ').replace(/[,]+/g, '').trim(), { length: 48 })
}


