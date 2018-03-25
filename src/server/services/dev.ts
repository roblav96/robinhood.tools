// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'
import * as pretty from '../../common/pretty'

import * as dts from 'dts-gen'
import * as clipboardy from 'clipboardy'
import ticks from './ticks'



process.DEV_MEMORY = process.memoryUsage()
declare global { namespace NodeJS { interface Process { BONE_MEMORY: MemoryUsage, PROC_MEMORY: MemoryUsage, DEV_MEMORY: MemoryUsage } } }

if (DEVELOPMENT && process.MASTER) {
	ticks.EE3.addListener(ticks.T30, outputMemory)
	// outputMemory()
}

function outputMemory() {
	let to = process.memoryUsage()
	console.warn('MEMORY FOOTPRINT ->')
	inspectMemory(to, 'BONE_MEMORY')
	inspectMemory(to, 'PROC_MEMORY')
	inspectMemory(to, 'DEV_MEMORY')
}

function inspectMemory(to: NodeJS.MemoryUsage, key: string) {
	to = core.json.clone(to)
	let from = process[key]
	Object.keys(to).forEach(function(key) {
		to[key] = pretty.bytes(to[key] - from[key])
	})
	let name = key.split('_').shift().toLowerCase()
	eyes.inspect({ total: to.heapTotal, used: to.heapUsed }, name)
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

