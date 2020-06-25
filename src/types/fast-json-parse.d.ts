//

declare module 'fast-json-parse' {
	namespace jsonparse {
		interface Parsed<T = any> {
			value: T
			err: Error
		}
	}
	function jsonparse<T = any>(json: any): jsonparse.Parsed<T>
	export = jsonparse
}
