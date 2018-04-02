// 

import * as stream from 'stream'
import * as got from 'got'
import * as boom from 'boom'



export const config = {
	json: true,
	silent: PRODUCTION,
	timeout: 10000,
	retries(i: number) {
		console.log('http retries i ->', i)
		return i
	},
} as Partial<Http.Config>





declare global {
	namespace Http {
		interface Config extends got.GotJSONOptions {
			url: string
			query: any
			silent: boolean
			isProxy: boolean
			robinhoodToken: string
			webullAuth: boolean
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



