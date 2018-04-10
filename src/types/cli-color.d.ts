// 



declare module 'cli-color/move' {
	function ClcMove(x: any, y: any): any
	namespace ClcMove {
		function down(num: any): any
		function left(num: any): any
		function lines(n: any): any
		function right(num: any): any
		function to(x: any, y: any): any
		function up(num: any): any
	}
	export = ClcMove
}

declare module 'cli-color/window-size' {
	namespace ClcWindowSize {
		const height: number
		const width: number
	}
	export = ClcWindowSize
}

declare module 'cli-color/columns' {
	function ClcColumns(value: any): any
	namespace ClcColumns { }
	export = ClcColumns
}

declare module 'cli-color/strip' {
	function ClcStrip(value: string): string
	namespace ClcStrip { }
	export = ClcStrip
}

declare module 'cli-color/erase' {
	namespace ClcErase {
		const line: string
		const lineLeft: string
		const lineRight: string
		const screen: string
		const screenLeft: string
		const screenRight: string
	}
	export = ClcErase
}





// import * as clc from 'cli-color'
// declare module 'cli-color' {
// 	namespace m {
// 		export interface Format {
// 			columns(): any
// 		}
// 	}
// }


