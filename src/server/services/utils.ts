// 

import * as eyes from 'eyes'
import * as _ from 'lodash'
import * as core from '../../common/core'

import * as dtsgen from 'dts-gen'



export function expose(name: string, input: any, skips = [] as string[]) {
	process.stdout.write('\n\n')

	let keys = _.uniq(_.keys(input).concat(_.keysIn(input)))
	eyes.inspect(keys, '"' + name + '"' + ' properties')

	let fns = _.uniq(_.functions(input).concat(_.functionsIn(input)))
	eyes.inspect(fns, '"' + name + '"' + ' methods')

	let all = _.uniq(keys.concat(fns)).filter(v => skips.indexOf(v) == -1)
	eyes.inspect(all, '"' + name + '"' + ' all')
	all.forEach(function(key) {
		let result = dtsgen.generateIdentifierDeclarationFile(key, input[key])
		console.log(key, '>', result)
	})

}

