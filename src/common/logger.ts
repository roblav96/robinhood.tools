// 

import * as util from 'util'
import * as eyes from 'eyes'
import * as Pino from 'pino'
import * as moment from 'moment'
import * as devtools from '../server/services/devtools'



const logger = Pino({
	name: process.NAME,
	prettyPrint: {
		formatter: function(log, config) {
			console.log('log ->', log)

			let method = logger.levels.labels[log.level]
			// console.log('method ->', method)
			let stack = new Error('ohno')//.stack.toString().split('\n')
			console.log('stacsk ->', stack)
			// stack = stack.replace(/^ {1}at /gm, '').split('\n')[1].trim()
			// console.log('stack ->', stack)

			return `\nreturn logger.prettyPrint.formatter -> string`

		} as Pino.PrettyFormatter,
		forceColor: true, levelFirst: true,
	},
})
// logger.addLevel('log', 25)

// console.log('logger ->', logger)
// console.log('logger.pinosssdw ->', logger.pino)
// console.log('logger ->', logger)
// console.info('logger ->')
// eyes.inspect(logger)

// console.log('logger ->', logger)
// devtools.expose('logger ->', logger)



const elogger = function(...args) {
	logger.error.apply(logger, [util.format.apply(util.format, Array.prototype.slice.call(args))])
	// logger.error.call(logger, ...args)
}

import * as boom from 'boom'
// let error = boom.internal(`Oh no, an awesome boom.internal error has occured!`)
// console.error('boom.internal Error ->', error)
// elogger('boom.internal Error ->', error)





// {
// 	['log', 'info', 'warn', 'error'].forEach(function(key) {
// 		console[key] = function(...args) {
// 			logger[key].apply(logger, [util.format.apply(util.format, Array.prototype.slice.call(args))])
// 		}
// 	})
// }



export default logger





// import * as fs from 'fs'
// const dest = fs.createWriteStream('dest/logger.log')
// dest.write = function(message, next) {
// 	console.log('dest.write message ->', message)
// 	next()
// 	return true
// 	// process.stdout.write('dest.write message ->' + message)
// }


