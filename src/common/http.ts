// 

import * as stream from 'stream'
import * as got from 'got'
import * as boom from 'boom'





declare global {
	namespace Http {
		interface RequestConfig extends got.GotJSONOptions {
			url: string
			query: any
			silent: boolean
			isProxy: boolean
			rhAuthToken: string
			wbAuthToken: boolean
		}
		interface Payload extends boom.Payload {
			
		}
		interface GotResponse<T = any> extends got.Response<T>, stream.PassThrough {
			
		}
		interface GotError<T = any> extends Error {
			name: string
			host: string
			hostname: string
			method: string
			path: string
			protocol: string
			url: string
			statusCode: number,
			statusMessage: string
			headers: Dict<string>
			response: GotResponse<T>
		}
	}
}



