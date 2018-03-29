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
	name: process.NAME,
	level: 'warn',

	serializers: {
		'console': function consoleSerializer(value: any) {
			console.log('value ->', value)
			return value
		}
	},

	prettyPrint: {
		// errorLikeObjectKeys: [],
		formatter: (function(log, config) {
			console.log('log ->', log)
			// console.time('formatter')

			{ let PRETTY_FRAMES = stacktrace.get().map(pretty.frame); console.log('PRETTY_FRAMES ->', PRETTY_FRAMES); }
			let frames = stacktrace.get()
			let index = frames.findIndex(function(frame) {
				return frame.getTypeName() == 'EventEmitter' && (frame.getFileName() == 'pino' || frame.getFunctionName() == 'pinoWrite')
			})
			let frame = pretty.frame(frames[index + 3])
			frame.sourceUrl = frame.sourceUrl.replace(process.cwd() + '/', '')
			console.log('frame ->', frame)
			Object.assign(log, frame)
			log.sourceUrl = log.sourceUrl.replace(process.cwd() + '/', '')
			log.method = logger.levels.labels[log.level]

			console.log('log ->', log)





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

})

// logger.addLevel('log', 25)





global._console = {} as typeof console
declare global { var _console: Console; interface WindowConsole { readonly _console: Console } namespace NodeJS { export interface Global { _console: typeof console } } }

// const proxies = ['log', 'info', 'warn', 'error']
const proxies = ['warn']
let i: number, len = proxies.length
for (i = 0; i < len; i++) {
	let proxy = proxies[i]
	Object.assign(global._console, { [proxy]: global.console[proxy] })
	Object.assign(global.console, {
		[proxy](...args) {
			// global._console[proxy].apply(global._console, args)
			logger.child({ console: true })[proxy].call(logger, [...args])
			// logger[proxy].call(logger, [...args])
			// logger[proxy].call(logger, [...args.map(util.inspect as any)])
		},
	})
}





export default logger



// {
// 	(function proxyConsole(keys) {
// 		keys.forEach
// 	})(['error'])
// }




