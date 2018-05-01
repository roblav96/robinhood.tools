// 

declare module 'simple-get' {
	import * as http from 'http'

	namespace simpleget {
		interface RequestOptions extends http.RequestOptions {
			method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'DELETE'
			headers: { [header: string]: string }
			url: string
			body: any
			form: any
			json: boolean
			maxRedirects: number
		}
		interface ResponseCallback {
			(error: Error, res: http.IncomingMessage, data?: Buffer | string): void
		}
		function concat(opts: Partial<RequestOptions>, cb: ResponseCallback): void
		function get(opts: Partial<RequestOptions>, cb: ResponseCallback): void
		function head(opts: Partial<RequestOptions>, cb: ResponseCallback): void
		function patch(opts: Partial<RequestOptions>, cb: ResponseCallback): void
		function post(opts: Partial<RequestOptions>, cb: ResponseCallback): void
		function put(opts: Partial<RequestOptions>, cb: ResponseCallback): void
	}
	function simpleget(opts: Partial<simpleget.RequestOptions>, cb: simpleget.ResponseCallback): void
	export = simpleget

}


