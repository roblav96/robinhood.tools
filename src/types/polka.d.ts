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
		interface Handler<Request, Response, NextError> {
			(req: Request, res: Response, next: (error?: NextError) => void): void
		}
		class Options<Server, Request, Response, NextError> {
			server: Server
			onError(error: NextError, req: Request, res: Response, next: (error?: NextError) => void): void
			onNoMatch(req: Request, res: Response): void
		}
		interface Router<Server, Request, Response, NextError> extends Trouter<(req: Request, res: Response) => void, Options<Server, Request, Response, NextError>> { }
		class Router<Server, Request, Response, NextError> extends Options<Server, Request, Response, NextError> {
			constructor(options: Options<Server, Request, Response, NextError>)
			apps: { [base: string]: Router<Server, Request, Response, NextError> }
			wares: Handler<Request, Response, NextError>[]
			bwares: { [base: string]: Handler<Request, Response, NextError>[] }
			parse(req: Request): url.UrlWithStringQuery
			use(base: string, fn: Handler<Request, Response, NextError>)
			use(...fn: Handler<Request, Response, NextError>[])
			handler(req: Request, res: Response, parsed: url.UrlWithStringQuery)
			listen(port: number, hostname?: string): Promise<void>
		}
	}
	function Polka<Server = http.Server, Request = http.IncomingMessage, Response = http.ServerResponse, NextError = Error>(options?: Partial<Polka.Options<Server, Request & Polka.Request, Response, NextError>>): Polka.Router<Server, Request & Polka.Request, Response, NextError>
	export = Polka

}


