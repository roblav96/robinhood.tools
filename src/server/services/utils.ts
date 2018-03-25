// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'



export function dispersedMs(ms: number, i: number, length: number) {
	return Math.round(i * (ms / length))
}
export function instanceMs(ms: number) {
	return Math.round(Math.max(process.INSTANCE, 0) * (ms / process.INSTANCES))
}









