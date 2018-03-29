// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as util from 'util'
import * as _ from 'lodash'
import * as Pino from 'pino'
import * as moment from 'moment'
import * as stacktrace from 'stack-trace'
import * as pretty from './pretty'



const logger = Pino({
	// name: process.NAME,
	prettyPrint: {
		formatter: (function(log, config) {
			// console.log('log ->', log)
			console.time('formatter')

			let frames = stacktrace.get()
			let index = frames.findIndex(function(frame) {
				let src = frame.getFileName() || frame.getScriptNameOrSourceURL() || frame.getEvalOrigin()
				return src.includes('/dist/') && frame.getTypeName() == 'Console'
			})
			Object.assign(log, pretty.frame(frames[index + 1]))
			log.sourceUrl = log.sourceUrl.replace(process.cwd() + '/', '')
			log.method = logger.levels.labels[log.level]

			// console.info(`${chalk.bold.redBright('████  formatter -> log  ████')}\n`, eyes.stringify(log))
			console.log(`${chalk.bold.blueBright('████  formatter -> log  ████')}\n`, log)

			if (log.msg) {
				process.stdout.write(`\n\n${chalk.bold.red(`process.stdout.write log.msg ->`)}\n\n${log.msg}\n\n`)
			} else {
				let i: number, len = 11
				for (i = 0; i < len; i++) {
					if (log[i]) {
						process.stdout.write(`\n\n${chalk.bold.red(`process.stdout.write ${i} ->`)}\n\n${log[i]}\n\n`)
					}
				}
			}

			console.timeEnd('formatter')
			return '\nformatter -> return string'

		} as Pino.PrettyFormatter) as any,
	},
})
// logger.addLevel('log', 25)





global._console = {} as typeof console
declare global { var _console: Console; interface WindowConsole { readonly _console: Console } namespace NodeJS { export interface Global { _console: typeof console } } }

// const proxies = ['log', 'info', 'warn', 'error']
const proxies = ['error']
let i: number, len = proxies.length
for (i = 0; i < len; i++) {
	let proxy = proxies[i]
	Object.assign(global._console, { [proxy]: global.console[proxy] })
	Object.assign(global.console, {
		[proxy](...args) {
			// console.log('args ->', args)
			logger[proxy].call(logger, [...args.map(util.inspect as any)])
			// logger[proxy].apply(logger, _.map(args, _.unary(wtf)))
			// logger[proxy].apply(logger, ...args.map(wtf))
			// logger[proxy].apply(logger, [eyes.stringify.apply(eyes.stringify, args)])
			// logger[proxy].apply(logger, [util.format.call(util.format, Array.prototype.slice.call(args))])
			// logger[proxy].apply(logger, [args])
			// logger[proxy].apply(logger, [Array.prototype.slice.call(args).map(wtf)])
			// logger[proxy].apply(logger, [util.inspect.call(util.inspect, args)])
			// logger[proxy].apply(logger, [[...args].map(util.format)])
			// logger[proxy].call(logger, [util.format.call(util.format, Array.prototype.slice.call(args))])
			// logger[proxy].call(logger, [...args])
			// logger[proxy].apply(logger, ...args.map(util.format))
			if (process.env.INSPECTING) global._console[proxy](...args);
			// logger[proxy].call(logger, [...args.map(util.inspect as any)])
			// logger[proxy].apply(logger, [util.format.apply(util.format, Array.prototype.slice.call(args))])
		},
	})
}





import * as boom from 'boom'
let error = boom.internal(`A horrible internal error has occured!!!`)

function testLoggerError() {
	console.time('console.error')
	console.error('boom.internal Error ->', error, 'error.message ->', `"${error.message}"`, 'error.stack ->', error.stack)
	console.timeEnd('console.error')
}
testLoggerError()





export default logger



// {
// 	(function proxyConsole(keys) {
// 		keys.forEach
// 	})(['error'])
// }




