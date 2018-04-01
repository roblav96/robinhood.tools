// 

import * as dtsgen from 'dts-gen-wtf'

export default function generate(value: any) {
	if (value == null) return 'value == null';
	// let results = dtsgen.generateModuleDeclarationFile('value', value) as string
	let results = dtsgen.generateIdentifierDeclarationFile('value', value) as string
	results = results.replace(`declare namespace value`, '').trim()
	results = results.replace(`declare const value:`, '').trim()
	results = results.replace(/;/g, '').replace(/\015\n\015\n+/g, '\n').trim()
	// let padding = process.CLIENT ? '\n\n\n' : ''
	results = '\n\n\n' + results + '\n\n\n'
	return results
}

declare global { interface Console { dtsgen(value: any): string } }


