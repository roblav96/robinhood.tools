// 



import * as util from 'util'
Object.assign(util.inspect.defaultOptions, { depth: 2, showHidden: false, showProxy: false, compact: false, breakLength: Infinity, maxArrayLength: Infinity, colors: true } as Partial<typeof util.inspect.defaultOptions>)
Object.assign(util.inspect.styles, { string: 'green', regexp: 'green', date: 'green', number: 'magenta', boolean: 'blue', undefined: 'red', null: 'red', symbol: 'cyan', special: 'cyan' })



import * as dayjs from 'dayjs'
import * as clc from 'cli-color'
import * as StackTracey from 'stacktracey'
const _console = {} as typeof console
let methods = ['log', 'info', 'warn', 'error']
let i: number, len = methods.length
for (i = 0; i < len; i++) {
	let method = methods[i]
	Object.assign(_console, { [method]: console[method] })
	Object.assign(console, {
		[method](...args: any[]) {
			let stack = new StackTracey()
			let site = stack[1]
			let stamp = dayjs().format(process.env.PRODUCTION ? 'dddd, MMM DD YYYY, hh:mm:ss:SSSa' : 'hh:mm:ss:SSS')
			let colors = { log: 'blue', info: 'green', warn: 'yellow', error: 'red' }
			let color = (colors[method] || 'magenta') as string
			let square = clc[color + 'Bright']('█') as string
			if (method == 'error') color = color + 'Bright';
			let file = clc.bold(`${(site.fileName as string).slice(0, -3)}`) + ':' + site.line
			let name = process.env.NAME ? `[${process.env.NAME}]` : ''
			let instance = process.env.INSTANCE ? `[${process.env.INSTANCE}]` : ''
			let output = clc.underline(`${square}[${file}]${instance}${name}${site.callee}[${clc.blackBright(stamp)}]`)
			if (method == 'error' && args.length > 0) {
				let error = 'ERROR'
				let first = args[0]
				if (util.isString(first) && first.indexOf('UN') == 0) error = first;
				output = clc.bold.redBright(`████  ${error}  ████\r\n`) + output
			}
			process.stdout.write(`\r\n${output}\r\n`)
			_console[method].apply(console, args)
			process.stdout.write(`\r\n`)
		},
	})
}

import * as inspector from 'inspector'
import * as exithook from 'exit-hook'
if (process.env.DEBUGGER) {
	let offset = +process.env.OFFSET + +process.env.INSTANCE
	let port = process.debugPort + offset
	inspector.open(port)
	if (offset == 0) {
		let stdout = (console as any)._stdout
		if (stdout.isTTY) { stdout.isTTY = false; process.nextTick(() => stdout.isTTY = true) }
		console.clear()
	}
	exithook(() => inspector.close())
}
declare global { namespace NodeJS { interface Process { debugPort: number } } }
declare global { namespace NodeJS { interface ProcessEnv { DEBUGGER: any } } }



Object.assign(console, { dtsgen: function() { } })
// if (process.env.DEVELOPMENT) console.dtsgen = require('../../common/dtsgen').default;


