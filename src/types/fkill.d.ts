//

declare module 'fkill' {
	namespace fkill {
		interface Options {
			force: boolean
			tree: boolean
			ignoreCase: boolean
		}
	}
	function fkill(input: number, opts?: Partial<fkill.Options>): void
	function fkill(input: string, opts?: Partial<fkill.Options>): void
	function fkill(input: number[], opts?: Partial<fkill.Options>): void
	function fkill(input: string[], opts?: Partial<fkill.Options>): void
	export = fkill
}
