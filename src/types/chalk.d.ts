//

import * as chalk from 'chalk'

declare module 'chalk' {
	export interface Chalk {
		(...text: (string | number)[]): string
	}
}
