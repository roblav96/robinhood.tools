//

declare module 'simple-get' {
	import * as http from 'http'

	namespace SimpleGet {
		interface Headers extends http.IncomingHttpHeaders {
			[key: string]: any
		}
		interface RequestOptions extends http.RequestOptions {
			method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'DELETE'
			headers: Headers
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
	function SimpleGet(
		opts: Partial<SimpleGet.RequestOptions>,
		cb: SimpleGet.ResponseCallback,
	): void
	export = SimpleGet
}
