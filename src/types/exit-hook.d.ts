// 

declare module 'exit-hook' {
	function exithook(fn: () => any): any
	namespace exithook { }
	export = exithook
}
