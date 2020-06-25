//

declare module 'exit-hook' {
	namespace exithook {}
	function exithook(fn: () => void): void
	export = exithook
}
