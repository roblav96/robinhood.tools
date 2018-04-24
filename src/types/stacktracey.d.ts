// 

declare module 'stacktracey' {

	class StackTracey {
		constructor(...args: any[])

		at(...args: any[]): void

		concat(...args: any[]): any

		filter(...args: any[]): any

		map(...args: any[]): any

		reverse(...args: any[]): any

		slice(...args: any[]): any

		withSource(...args: any[]): void

		static extractEntryMetadata(...args: any[]): void

		static from(p0?: any): any

		static isArray(p0?: any): any

		static isThirdParty(...args: any[]): void

		static locationsEqual(...args: any[]): void

		static of(): any

		static rawParse(...args: any[]): void

		static relativePath(...args: any[]): void

		static resetCache(...args: any[]): void

		static shortenPath(...args: any[]): void

		static stack?: any

		static withSource(...args: any[]): void

	}

	namespace StackTracey { }

	export = StackTracey

}