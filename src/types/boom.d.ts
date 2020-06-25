//

import * as boom from 'boom'

declare module 'boom' {
	interface Payload {
		isBoom: boolean
	}
}
