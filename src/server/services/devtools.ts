// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as pretty from '../../common/pretty'
import ticks from '../../common/ticks'

import * as dts from 'dts-gen'
import * as clipboardy from 'clipboardy'



const initheap = process.memoryUsage()
function inspectHeap() {
	let nowheap = process.memoryUsage()
	Object.keys(nowheap).forEach(function(key) {
		nowheap[key] = pretty.bytes(nowheap[key] - initheap[key])
	})
	console.log('memory heap ->', chalk.bold(nowheap.heapUsed), 'used', chalk.bold(nowheap.heapTotal), 'total')
}

if (process.MASTER || process.INSTANCE == process.INSTANCES) {
	ticks.EE4.addListener(ticks.T60, inspectHeap)
	// inspectHeap()
}



export function keys(name: string, value: any, skips = [] as string[]) {
	let keys = _.uniq(_.keys(value).concat(_.keysIn(value)))
	let functions = _.uniq(_.functions(value).concat(_.functionsIn(value)))
	let all = _.uniq(keys.concat(functions)).filter(v => skips.indexOf(v) == -1)
	console.info('\n' + chalk.bold(name), '\n\nKEYS ->', inspect(keys), '\n\nMETHODS ->', inspect(functions), '\n\nALL ->', inspect(all))
}

export function dtsgen(name: string, value: any) {
	if (PRODUCTION || process.INSTANCE > 0) return;
	name = _.startCase(name)
	return clipboardy.write(dts.generateIdentifierDeclarationFile(name, value)).then(function() {
		console.info('dtsgen ->', chalk.bold(name))
	}).catch(error => console.error('dtsgen Error ->', error))
}

export function clipboard(name: string, value: any) {
	if (PRODUCTION || process.INSTANCE > 0) return;
	name = _.startCase(name)
	return clipboardy.write(value).then(function() {
		console.info('clipboard ->', chalk.bold(name))
	}).catch(error => console.error('clipboard Error ->', error))
}

export function expose(name: string, input: any, skips = [] as string[]) {
	if (PRODUCTION || process.INSTANCE > 0) return;
	name = _.startCase(name)
	console.warn(chalk.yellow('expose -> ' + chalk.bold(name)))

	let keys = _.uniq(_.keys(input).concat(_.keysIn(input)))
	eyes.inspect(keys, `${name} keys`)

	let functions = _.uniq(_.functions(input).concat(_.functionsIn(input)))
	eyes.inspect(functions, `${name} functions`)

	let all = _.uniq(keys.concat(functions)).filter(v => skips.indexOf(v) == -1)
	eyes.inspect(all, `${name} all`)
	all.forEach(function(key) {
		let types = dts.generateIdentifierDeclarationFile(key, input[key])
		console.log('types', key, '->', types)
	})

}


