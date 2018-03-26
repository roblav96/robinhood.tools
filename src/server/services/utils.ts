// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'



export function dispersedMs(ms: number, i: number, length: number) {
	return Math.round(i * (ms / length))
}
export function instanceMs(ms: number) {
	return Math.round(Math.max(process.INSTANCE, 0) * (ms / process.INSTANCES))
}



export function keys(name: string, value: any, skips = [] as string[]) {
	let keys = _.uniq(_.keys(value).concat(_.keysIn(value)))
	let functions = _.uniq(_.functions(value).concat(_.functionsIn(value)))
	let all = _.uniq(keys.concat(functions)).filter(v => skips.indexOf(v) == -1)
	console.info('\n' + chalk.bold(name), '\n\nKEYS ->', inspect(keys), '\n\nMETHODS ->', inspect(functions), '\n\nALL ->', inspect(all))
}





