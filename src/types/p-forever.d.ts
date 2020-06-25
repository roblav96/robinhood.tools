//

declare module 'p-forever' {
	export = p_forever

	function p_forever<T, U>(fn: (result?: T) => Promise<U>, initResult?: T): Promise<U>

	namespace p_forever {
		const end: Promise<any>
	}
}
