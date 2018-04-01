// 

import * as dtsgen from 'dts-gen'

export default function generate(value: any) {
	if (value == null) return 'value == null';
	let results = dtsgen.generateModuleDeclarationFile('value', value) as string
	results = results.replace(/;/g, '').replace(/\015\n\015\n+/g, '\n').trim()
	results = results.replace(`export = value\ndeclare namespace value`, '').trim()
	results = `\n\n\n${results}\n\n\n`
	return results
}
declare global { interface Console { dtsgen(value: any): string } }


