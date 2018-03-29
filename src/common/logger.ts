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

			// console.info('log[1] ->', eyes.stringify(log[1]))
			// console.log('log[1] ->', util.inspect(log[1]))
			console.info('log ->', eyes.stringify(log))

			log.method = logger.levels.labels[log.level]

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

			let frames = stacktrace.get()
			let index = frames.findIndex(function(frame) {
				let src = frame.getFileName() || frame.getScriptNameOrSourceURL() || frame.getEvalOrigin()
				return src.includes('/dist/') && frame.getTypeName() == 'Console'
			})
			log.frame = pretty.frame(frames[index + 1])
			log.functionName
			// console.info('log.frame ->', eyes.stringify(log.frame))

			// console.info('log ->', eyes.stringify(log))

			// let frames = stacktrace.get().map(pretty.frame)
			// console.info('frames ->', eyes.stringify(frames))

			// let index = frames.findIndex(v => v.sourceUrl.includes('/dist/') && v.typeName == 'Console')
			// log.frame = frames[index + 1]
			// console.log('log.frame ->', log.frame)

			// let fmap = { 'pinoWrite': -1, 'LOG': -1, 'EventEmitter': -1 }
			// frames.forEach(function(v, i) {
			// 	if (v.functionName == 'pinoWrite') fmap['pinoWrite'] = i;
			// 	if (v.functionName == 'LOG') fmap['LOG'] = i;
			// 	if (v.typeName == 'EventEmitter') fmap['EventEmitter'] = i;
			// })
			// log.frame = frames[(_.max(Object.values(fmap)) + 2)]

			console.timeEnd('formatter')
			return '\nformatter -> return string'

		} as Pino.PrettyFormatter) as any,
	},
})
// logger.addLevel('log', 25)



global._console = {} as typeof global.console
declare global {
	var _console: Console
	interface WindowConsole { readonly _console: Console }
	namespace NodeJS { export interface Global { _console: typeof console } }
}



{
	// const proxies = ['log', 'info', 'warn', 'error']
	const proxies = ['error']
	let i: number, len = proxies.length
	for (i = 0; i < len; i++) {
		let proxy = proxies[i]
		Object.assign(global._console, { [proxy]: global.console[proxy] })
		Object.assign(global.console, {
			[proxy](...args) {
				// logger[proxy].call(logger, [util.format.call(util.format, ...args)])
				// logger[proxy].apply(logger, [...args].map(util.inspect))
				// logger[proxy].call(logger, [util.format.call(util.format, Array.prototype.slice.call(args))])
				// logger[proxy].call(logger, [...args])
				logger[proxy].call(logger, ...args.map(util.format))
				if (process.env.INSPECTING) global._console[proxy](...args);
				// logger[proxy].apply(logger, [util.format.apply(util.format, Array.prototype.slice.call(args))])
			},
		})
	}
}



import * as boom from 'boom'
let error = boom.internal(`An horrible internal error has occured! :(`)

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




