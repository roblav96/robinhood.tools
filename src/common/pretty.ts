// 

import * as util from 'util'
import * as pms from 'pretty-ms'
import * as pbytes from 'pretty-bytes'
import * as Humanize from 'humanize-plus'



export function plural(input: string, value: number) {
	return Humanize.pluralize(value, input)
}

export function ms(ms: number) {
	return pms(ms)
}

export function bytes(bytes: number) {
	return pbytes(bytes)
}


