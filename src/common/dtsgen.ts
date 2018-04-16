// 

import * as dtsgen from 'dts-gen-v2'

export default function generate(value: any) {
	if (value == null) return 'value == null';

	let results = dtsgen.generateIdentifierDeclarationFile('____', value) as string
	results = results.replace(/;/g, '').replace(/\015\n\015\n+/g, '\n').trim()
	results = results.replace(/    /g, '\t').trim()
	return results

}

declare global { interface Console { dtsgen(value: any): string } }


