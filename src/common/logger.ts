// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as util from 'util'
import * as _ from 'lodash'
import * as Pino from 'pino'
import * as moment from 'moment'
import * as stream from 'stream'
import * as stacktrace from 'stack-trace'
import * as pretty from './pretty'



const logger = Pino({
	// name: process.NAME,
	// level: 'warn',
	prettyPrint: {
		// errorLikeObjectKeys: [],
		formatter: (function(log, config) {
			process.stdout.write('\n\nBEFORE log ->\n' + eyes.stringify(log))
			// console.time('formatter')

			// let PRETTY_FRAMES = stacktrace.get().map(pretty.frame)
			let offset = log.pconsole ? 3 : 2
			let frames = stacktrace.get()
			let index = frames.findIndex(v => v.getTypeName() == 'EventEmitter' && (v.getFileName() == 'pino' || v.getFunctionName() == 'pinoWrite')) || -offset
			let PRETTY_FRAMES = frames.map(pretty.frame).splice(index + 1)
			// console.info('PRETTY_FRAMES ->', PRETTY_FRAMES)
			log.frame = pretty.frame(frames[index + offset])

			log.label = logger.levels.labels[log.level]
			if (log.pconsole) log.label = log.pconsole.method;

			let colors = { log: 'blue', info: 'green', debug: 'magenta', warn: 'yellow', error: 'red', fatal: 'red' } as Dict<string>
			let color = colors[log.label] || 'magenta'

			let square = chalk[color + 'Bright']('█')
			if (log.label == 'error') color = color + 'Bright';

			let srcpath = log.frame.sourceUrl.replace('src/server/', '')
			let srcfile = log.frame.fileName + '.' + log.frame.fileExt
			let meta = '[' + chalk.grey(srcpath.replace(srcfile, '') + chalk.bold[color](srcfile)) + ':' + chalk.bold(log.frame.line) + '' + chalk.grey('➤' + (log.frame.functionName || '') + '()') + ']'
			let instance = '[' + chalk.gray(process.INSTANCE) + ']'
			let stamp = moment(log.time).format('hh:mm:ss:SSS')
			let header = square + meta + instance + chalk.gray('T-') + stamp
			header = chalk.underline(header)
			// console.log('header ->', header)

			let output = log.msg
			if (log.pconsole) output = log.pconsole.args.join('\n');

			// console.timeEnd('formatter')
			// console.log('AFTER log ->', log)
			return '\n\n' + header + '\n' + output

		} as Pino.PrettyFormatter) as any,
	},

	serializers: {
		'pconsole': function pconsole(pconsole: Pino.ConsoleLog) {
			// console.log('pconsole ->', pconsole)
			return pconsole
		},
	},

})

// logger.addLevel('log', 25)





global._console = {} as typeof console
declare global { var _console: Console; interface WindowConsole { readonly _console: Console } namespace NodeJS { export interface Global { _console: typeof console } } }

const methods = ['warn', 'log', 'info', 'error']
// if (DEVELOPMENT) methods.splice(1);
let i: number, len = methods.length
for (i = 0; i < len; i++) {
	let method = methods[i]
	Object.assign(global._console, { [method]: global.console[method] })
	Object.assign(global.console, {
		[method](...args) {
			global._console[method].apply(global._console, args)
			logger[(method == 'log' ? 'info' : method)].apply(logger, [{ pconsole: { method, args } }])
			// try {
			// 	logger[(method == 'log' ? 'info' : method)].apply(logger, [{ pconsole: { method, args } }])
			// } catch (error) {
			// 	console.error('console catch Error ->', error)
			// 	global._console[method].apply(global._console, args)
			// }
		},
	})
}





export default logger



declare module 'pino' {
	export interface ConsoleLog {
		method: string
		args: any[]
	}
	export interface LogDescriptor {
		label: string
		release: string
		instance: number
		frame: Pretty.StackFrame
		pconsole: ConsoleLog
		// error: typeof boom
		[index: number]: any
	}
}


