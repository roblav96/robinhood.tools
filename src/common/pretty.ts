// 

import * as util from 'util'
import * as pms from 'pretty-ms'
import * as pbytes from 'pretty-bytes'



// export function args(args) {
// 	return [util.format.apply(util.format, Array.prototype.slice.call(args))]
// }

export function ms(ms: number) {
	return pms(ms)
}

export function bytes(bytes: number) {
	return pbytes(bytes)
}




