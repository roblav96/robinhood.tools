// 

declare module 'polka' {
	import * as http from 'http'
	import * as url from 'url'
	import * as Trouter from 'trouter'

	interface Handler<Request, Response> {
		(req: Request, res: Response, next: (error?: Error) => void): void
	}
	class Options<Server, Request, Response> extends Trouter<(req: Request, res: Response) => void> {
		server: Server
		onError(error: Error, req: Request, res: Response, next: (error?: Error) => void): void
		onNoMatch(req: Request, res: Response): void
	}
	namespace Polka { }
	class Polka<Server, Request, Response> extends Options<Server, Request, Response> {
		constructor(options: Options<Server, Request, Response>)
		apps: { [base: string]: Polka<Server, Request, Response> }
		wares: Handler<Request, Response>[]
		bwares: { [base: string]: Handler<Request, Response>[] }
		parse(req: Request): url.UrlWithStringQuery
		use()
		handler()
		listen(port: number, hostname: string): Promise<void>
	}
	function polka<Server = http.Server, Request = http.IncomingMessage, Response = http.ServerResponse>(options: Options<Server, Request, Response>): Polka
	export = polka

}


