// 



import * as util from 'util'
Object.assign(util.inspect.defaultOptions, { depth: 1, showHidden: false, showProxy: false, compact: false, breakLength: Infinity, maxArrayLength: Infinity, colors: true } as Partial<typeof util.inspect.defaultOptions>)
Object.assign(util.inspect.styles, { string: 'green', regexp: 'green', date: 'green', number: 'magenta', boolean: 'blue', undefined: 'red', null: 'red', symbol: 'cyan', special: 'cyan' })



const pandora = process.env.PANDORA_CWD ? require('pandora') : null;
import chalk from 'chalk'
import * as luxon from 'luxon'
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
			let stamp = luxon.DateTime.local().toFormat('hh:mm:ss:SSS')
			let colors = { log: 'blue', info: 'green', warn: 'yellow', error: 'red' }
			let color = (colors[method] || 'magenta') as string
			let square = chalk[color + 'Bright']('█') as string
			if (method == 'error') color = color + 'Bright';
			let file = chalk.bold(`${chalk[color](site.fileName)}:${site.line}`)
			let pname = pandora ? `(${pandora.processName})` : ''
			let pi = process.env.INSTANCE ? `[${process.env.INSTANCE}]` : ''
			let output = chalk.underline(`${square}[${file}]${pi}${pname}${site.callee}[${chalk.grey(stamp)}]`)
			if (method == 'error' && args.length > 0) {
				let error = 'ERROR'
				let first = args[0]
				if (util.isString(first) && first.indexOf('UN') == 0) error = first;
				output = chalk.bold.redBright(`████  ${error}  ████\r\n`) + output
			}
			process.stdout.write(`\r\n${output}\r\n`)
			_console[method].apply(console, args)
			process.stdout.write(`\r\n`)
		},
	})
}



import * as inspector from 'inspector'
import * as onexit from 'exit-hook'
import * as clc from 'cli-color'
if (process.env.DEBUGGER == 'true') {
	inspector.open(process.debugPort + +process.env.OFFSET + +process.env.INSTANCE)
	onexit(function() {
		if (process.env.PRIMARY) {
			let stdout = (console as any)._stdout
			if (stdout.isTTY) { stdout.isTTY = false; process.nextTick(() => stdout.isTTY = true) }
			console.clear()
		}
		inspector.close()
	})
}
declare global { namespace NodeJS { export interface Process { debugPort: number } } }



import * as _ from '../../common/lodash'
import dtsgen from '../../common/dtsgen'
Object.assign(console, { dtsgen: _.noop })
if (process.env.DEVELOPMENT) {
	Object.assign(console, { dtsgen(value: any) { return dtsgen(value) } })
}


