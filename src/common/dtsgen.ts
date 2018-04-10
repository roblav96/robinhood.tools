// 

import * as dtsgen from 'dts-gen-v2'

export default function generate(value: any) {
	if (value == null) return 'value == null';
	
	let results = dtsgen.generateIdentifierDeclarationFile('value', value) as string
	// results = results.replace(`declare namespace value`, '').trim()
	// results = results.replace(`declare const value:`, '').trim()
	results = results.replace(/;/g, '').replace(/\015\n\015\n+/g, '\n').trim()
	
	return '\n\n' + results + '\n'
	
}

declare global { interface Console { dtsgen(value: any): string } }


