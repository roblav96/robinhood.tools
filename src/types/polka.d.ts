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
		interface Handler<Request, Response> {
			(req: Request, res: Response, next: (error?: Error) => void): void
		}
		class Options<Server, Request, Response> {
			server: Server
			onError(error: Error, req: Request, res: Response, next: (error?: Error) => void): void
			onNoMatch(req: Request, res: Response): void
		}
		interface Router<Server, Request, Response> extends Trouter<(req: Request, res: Response) => void, Options<Server, Request, Response>> { }
		class Router<Server, Request, Response> extends Options<Server, Request, Response> {
			constructor(options?: Partial<Options<Server, Request, Response>>)
			apps: { [base: string]: Router<Server, Request, Response> }
			wares: Handler<Request, Response>[]
			bwares: { [base: string]: Handler<Request, Response>[] }
			parse(req: Request): url.UrlWithStringQuery
			use(base: string, ...fn: Handler<Request, Response>[])
			use(...fn: Handler<Request, Response>[])
			handler(req: Request, res: Response, parsed: url.UrlWithStringQuery)
			listen(port: number, hostname?: string): Promise<void>
		}
	}
	function Polka<Server = http.Server, Request = http.IncomingMessage, Response = http.ServerResponse>(options?: Partial<Polka.Options<Server, Request & Polka.Request, Response>>): Polka.Router<Server, Request & Polka.Request, Response>
	export = Polka

}


