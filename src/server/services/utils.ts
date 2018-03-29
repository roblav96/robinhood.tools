// 

import * as eyes from 'eyes'
import * as core from '../../common/core'



export function named(extra = '') {
	extra = extra ? '[' + extra + ']' : extra
	return '[' + process.INSTANCE + '][' + core.string.alphanumeric(process.NAME) + ']' + extra + '[' + NODE_ENV + ']'
}





