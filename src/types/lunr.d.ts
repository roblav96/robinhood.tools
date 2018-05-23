// 

import * as lunr from 'lunr'

declare module 'lunr' {
	interface FieldOptions {
		boost: number
	}
	interface Builder {
		field(field: string, opts?: Partial<FieldOptions>): void
	}
}


