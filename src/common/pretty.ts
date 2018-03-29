// 



import * as pms from 'pretty-ms'
export function ms(ms: number) {
	return pms(ms)
}

import * as pbytes from 'pretty-bytes'
export function bytes(bytes: number) {
	return pbytes(bytes)
}


import * as Humanize from 'humanize-plus'
export function plural(input: string, value: number) {
	return Humanize.pluralize(value, input)
}


