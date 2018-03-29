// 

import * as util from 'util'
import * as fs from 'fs'
import * as Pino from 'pino'



const dest = fs.createWriteStream('dest/logger.log')
dest.write = function(message, next) {
	console.log('dest.write message ->', message)
	next()
	return true
	// process.stdout.write('dest.write message ->' + message)
}

const logger = Pino({
	level: 'debug',
	// prettyPrint: { forceColor: true, levelFirst: true, },
	extreme: true,
}, dest)

// const cls = ['log', 'info', 'warn', 'error']
// cls.forEach(function(key) {
// 	console[key] = function(...args) {
// 		if (key == 'log') key = 'info';
// 		logger[key].apply(logger, [util.format.apply(util.format, Array.prototype.slice.call(args))])
// 		// logger[key].apply(logger, util.inspect(args))
// 	}
// })



export default logger


