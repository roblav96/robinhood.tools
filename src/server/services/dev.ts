// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import * as dts from 'dts-gen'
import * as clipboardy from 'clipboardy'
import * as boxen from 'boxen'
import * as stdupdate from 'log-update'
import * as ticks from './ticks'



if (DEVELOPMENT && process.MASTER) {
	// ticks.EE3.addListener(ticks.TICKS.T1, i => console.log('i ->', i))
	// let box = boxen('58.5 MB', { float: 'right', padding: 1, margin: 1, borderStyle: 'double' })
	// const log = stdupdate.create(process.stdout, {
	// 	showCursor: true
	// })
	// setInterval(function() {
	// 	let heap = _.random(50, 100) + 'MB'
	// 	let box = boxen(heap, { float: 'right', borderStyle: 'round' })
	// 	stdupdate(box)
	// 	// process.stdout.write(box)
	// }, 100)
	
	let heap = process.memoryUsage()
	console.info('heap ->')
	eyes.inspect(heap)



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

