//

declare module 'matchit' {
	interface Match {
		old: string
		type: number
		val: string
	}
	export function parse(route: string): Match
	export function match(url: string, routes: string[]): Match[]
	export function exec(url: string, match: Match[]): { [key: string]: string }
}
