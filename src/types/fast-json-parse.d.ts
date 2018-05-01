// 

declare module 'fast-json-parse' {

	namespace jsonparse {
		interface Parsed<T = any> {
			value: T
			err: Error
		}
	}
	function jsonparse<T = any>(json: T): jsonparse.Parsed<T>
	export = jsonparse

}


