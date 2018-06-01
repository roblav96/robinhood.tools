// 

import * as lunr from 'lunr'

declare module 'lunr' {
	interface FieldOptions {
		boost: number
	}
	interface Builder {
		field(field: string, opts?: Partial<FieldOptions>): void
	}
	namespace Query {
		enum presence {
			OPTIONAL,
			PROHIBITED,
			REQUIRED,
		}
		interface Clause {
			presence: number
		}
	}
	interface Query {
		term(term: string, options: Partial<Query.Clause>): Query
	}
}


