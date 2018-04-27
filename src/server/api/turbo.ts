// 

import * as Request from 'turbo-http/lib/request'
import * as Response from 'turbo-http/lib/response'
import * as turbo from 'turbo-http'



declare module 'turbo-http/lib/request' {
	// class TurboRequest {
		var headers: Dict<string>
		var body: any // Body
	// }
	// export = TurboRequest
}

declare module 'turbo-http/lib/response' {
	interface Response {

	}
}




