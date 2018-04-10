// 



declare module 'cli-color' {
	import * as erase from 'cli-color/erase'
	import * as trim from 'cli-color/trim'
	import * as throbber from 'cli-color/throbber'
	import * as move from 'cli-color/move'
	import * as windowSize from 'cli-color/window-size'
	import * as columns from 'cli-color/columns'
	import * as strip from 'cli-color/strip'
	namespace m {
		export interface Format {
			(...text: any[]): string

			erase: typeof erase
			trim: typeof trim
			throbber: typeof throbber
			move: typeof move
			windowSize: typeof windowSize
			columns: typeof columns
			strip: typeof strip

			bold: Format
			italic: Format
			underline: Format
			blink: Format
			inverse: Format
			strike: Format

			black: Format
			red: Format
			green: Format
			yellow: Format
			blue: Format
			magenta: Format
			cyan: Format
			white: Format

			bgBlack: Format
			bgRed: Format
			bgGreen: Format
			bgYellow: Format
			bgBlue: Format
			bgMagenta: Format
			bgCyan: Format
			bgWhite: Format

			blackBright: Format
			redBright: Format
			greenBright: Format
			yellowBright: Format
			blueBright: Format
			magentaBright: Format
			cyanBright: Format
			whiteBright: Format

			bgBlackBright: Format
			bgRedBright: Format
			bgGreenBright: Format
			bgYellowBright: Format
			bgBlueBright: Format
			bgMagentaBright: Format
			bgCyanBright: Format
			bgWhiteBright: Format

			xterm(color: number): Format
			bgXterm(color: number): Format

			// move(x: number, y: number): string
			// moveTo(x: number, y: number): string
			// bol(n?: number, erase?: boolean): string
			// up(n: number): string
			// down(n: number): string
			// left(n: number): string
			// right(n: number): string

			beep: string
			reset: string

			width: number
			height: number
			xtermSupported: boolean
		}
	}

	var m: m.Format
	export = m
}

declare module 'cli-color/trim' {
	function ansiTrim(str: string): string
	namespace ansiTrim { }
	export = ansiTrim
}

declare module 'cli-color/throbber' {
	import clc = require('cli-color')
	namespace setupThrobber {
		export interface Throbber {
			start(): void
			stop(): void
			restart(): void
		}
	}
	function setupThrobber(write: (str: string) => any, period: number, format?: clc.Format): setupThrobber.Throbber
	export = setupThrobber
}

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



// declare module 'cli-color' {
// 	// import * as erase from 'cli-color/erase'
// 	namespace mm {
// 		// interface Format {
// 		// 	// erase: typeof erase
// 		// }
// 	}
// }





// import * as clc from 'cli-color'
// declare module 'cli-color' {
// 	namespace m {
// 		export interface Format {
// 			columns(): any
// 		}
// 	}
// }


