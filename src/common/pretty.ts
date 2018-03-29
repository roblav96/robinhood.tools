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



export const INT_WORDS = {
	0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
	10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen',
} as Dict<string>

export function toWords(number: number) {
	return INT_WORDS[number]
}




