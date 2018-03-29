// 

import chalk from 'chalk'
import * as eyes from 'eyes'
import * as util from 'util'
import * as _ from 'lodash'
import * as Pino from 'pino'
import * as moment from 'moment'
import * as strace from 'stack-trace'
import * as pretty from './pretty'



const logger = Pino({
	// name: process.NAME,
	prettyPrint: {
		formatter: (function(log, config) {
			console.log('log ->', log)
			console.time('formatter')
			let level = logger.levels.labels[log.level]

			// process.stdout.write(log[1])

			let fmap = { 'pinoWrite': -1, 'LOG': -1, 'EventEmitter': -1 }
			let frames = strace.get().map(pretty.frame)
			frames.forEach(function(v, i) {
				if (v.functionName == 'pinoWrite') fmap['pinoWrite'] = i;
				if (v.functionName == 'LOG') fmap['LOG'] = i;
				if (v.typeName == 'EventEmitter') fmap['EventEmitter'] = i;
			})
			log.frame = frames[(_.max(Object.values(fmap)) + 2)]
			// console.info('log.frame ->', eyes.stringify(log.frame))
			console.info('log.frame ->', eyes.stringify(log.frame))
			console.log('log.frame ->', log.frame)

			console.timeEnd('formatter')
			return '\nformatter -> return string'

		} as Pino.PrettyFormatter) as any,
		forceColor: true, levelFirst: true,
	},
})
// logger.addLevel('log', 25)



{
	// ['log', 'info', 'warn', 'error'].forEach(function(key) {
	['error'].forEach(function(key) {
		console[key] = function PROXY(...args: string[]) {
			// logger[key].apply(logger, [util.format.apply(util.format, Array.prototype.slice.call(args))])
			logger[key].apply(logger, [[...args].map(eyes.stringify)])
			// logger[key].call(logger, [...args].map(eyes.stringify))
		}
	})
}
import * as boom from 'boom'
function testerror() {
	let error = boom.internal(`Oh no, an awesome boom.internal error has occured!`)
	console.time('console.error')
	console.error('boom.internal Error ->', error, 'boom.internal ->', boom.internal)
	console.timeEnd('console.error')
}
testerror()



// console.error = function(...args) {
// 	logger.error.apply(logger, [util.format.apply(util.format, Array.prototype.slice.call(args))])
// }





// console.log('logger ->', logger)
// console.log('logger.pinosssdw ->', logger.pino)
// console.log('logger ->', logger)
// console.info('logger ->')
// eyes.inspect(logger)

// console.log('logger ->', logger)
// devtools.expose('logger ->', logger)



// const testlog = function(...args) {
// 	logger.error.apply(logger, [util.format.apply(util.format, Array.prototype.slice.call(args))])
// 	// logger.error.call(logger, ...args)
// }
// console.error('boom.internal Error ->', error)
// testlog('boom.internal Error ->', error)



export default logger





// import * as fs from 'fs'
// const dest = fs.createWriteStream('dest/logger.log')
// dest.write = function(message, next) {
// 	console.log('dest.write message ->', message)
// 	next()
// 	return true
// 	// process.stdout.write('dest.write message ->' + message)
// }


