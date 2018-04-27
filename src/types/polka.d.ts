// 

declare module 'polka' {
	import * as http from 'http'
	import * as url from 'url'
	import * as Trouter from 'trouter'

	namespace Polka {
		interface Request {
			originalUrl: string
			params: any
			path: string
			query: any
			search: string
		}
		interface Handler<Request, Response, ErrorCtor> {
			(req: Request, res: Response, next: (error?: ErrorCtor) => void): void
		}
	}
	class Options<Server, Request, Response, ErrorCtor> {
		server: Server
		onError(error: ErrorCtor, req: Request, res: Response, next: (error?: ErrorCtor) => void): void
		onNoMatch(req: Request, res: Response): void
	}
	interface Router<Server, Request, Response, ErrorCtor> extends Trouter<(req: Request, res: Response) => void, Options<Server, Request, Response, ErrorCtor>> { }
	class Router<Server, Request, Response, ErrorCtor> extends Options<Server, Request, Response, ErrorCtor> {
		constructor(options: Options<Server, Request, Response, ErrorCtor>)
		apps: { [base: string]: Router<Server, Request, Response, ErrorCtor> }
		wares: Polka.Handler<Request, Response, ErrorCtor>[]
		bwares: { [base: string]: Polka.Handler<Request, Response, ErrorCtor>[] }
		parse(req: Request): url.UrlWithStringQuery
		use(base: string, fn: Polka.Handler<Request, Response, ErrorCtor>)
		use(...fn: Polka.Handler<Request, Response, ErrorCtor>[])
		handler(req: Request, res: Response, parsed: url.UrlWithStringQuery)
		listen(port: number, hostname?: string): Promise<void>
	}
	function Polka<Server, Request, Response, ErrorCtor = Error>(options?: Options<Server, Request & Polka.Request, Response, ErrorCtor>): Router<Server, Request & Polka.Request, Response, ErrorCtor>
	export = Polka

}


