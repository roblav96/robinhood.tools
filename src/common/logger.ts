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
			console.log('BEFORE log ->', log)
			// console.time('formatter')
			log.label = logger.levels.labels[log.level]

			// let PRETTY_FRAMES = stacktrace.get().map(pretty.frame)
			// console.log('PRETTY_FRAMES ->', PRETTY_FRAMES)
			let offset = log.pconsole ? 3 : 2
			let frames = stacktrace.get()
			let index = frames.findIndex(v => v.getTypeName() == 'EventEmitter' && (v.getFileName() == 'pino' || v.getFunctionName() == 'pinoWrite')) || -offset
			let PRETTY_FRAMES = frames.map(pretty.frame).splice(index + 1)
			console.info('PRETTY_FRAMES ->', PRETTY_FRAMES)
			log.frame = pretty.frame(frames[index + offset])

			console.log('AFTER log ->', log)





			// if (log.msg) {
			// 	console.log('log.msg ->', log.msg)
			// } else {
			// 	let i: number, len = 11
			// 	for (i = 0; i < len; i++) {
			// 		if (log[i]) console.log('log[' + i + '] ->', log[i]);
			// 	}
			// }

			// console.log('log ->', log)
			// console.log('util.inspect(log) ->', util.inspect(log))

			// console.info('log[1] ->', eyes.stringify(log[1]))

			// if (log.msg) {
			// 	log.msg = strip(log.msg)
			// 	process.stdout.write(`\n\n${chalk.bold.red(`process.stdout.write log.msg ->`)}\n\n${log.msg}\n\n`)
			// } else {
			// 	let i: number, len = 11
			// 	for (i = 0; i < len; i++) {
			// 		if (log[i]) {
			// 			log[i] = strip(log[i])
			// 			process.stdout.write(`\n\n${chalk.bold.red(`process.stdout.write ${i} ->`)}\n\n${log[i]}\n\n`)
			// 		}
			// 	}
			// }
			// console.log(`${chalk.bold.blueBright('████  formatter -> log  ████')}\n`, log)



			// console.timeEnd('formatter')
			return '\n\nformatter -> return string'

		} as Pino.PrettyFormatter) as any,
	},

	serializers: {
		'pconsole': function pconsoleSerializer(pconsole: Pino.ConsoleLog) {
			// console.log('pconsole ->', pconsole)
			return pconsole
		},
	},

})

// logger.addLevel('log', 25)





global._console = {} as typeof console
declare global { var _console: Console; interface WindowConsole { readonly _console: Console } namespace NodeJS { export interface Global { _console: typeof console } } }

const methods = ['warn', 'log', 'info', 'error']
methods.splice(1)
console.log('methods ->', methods)
let i: number, len = methods.length
for (i = 0; i < len; i++) {
	let method = methods[i]
	Object.assign(global._console, { [method]: global.console[method] })
	Object.assign(global.console, {
		[method](...args) {
			logger[(method == 'log' ? 'info' : method)]({ pconsole: { method, args } })
			// logger.child({ pconsole: { method, args } })[method].call(logger, [...args])
			// global._console[method].apply(global._console, args)
			// logger[method].call(logger, [...args])
			// logger[method].call(logger, [...args.map(util.inspect as any)])
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


