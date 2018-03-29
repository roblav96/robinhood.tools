// 

import * as util from 'util'
import * as eyes from 'eyes'
import * as Pino from 'pino'
import * as moment from 'moment'
import * as boom from 'boom'



const logger = Pino({
	name: process.NAME,
	prettyPrint: {
		formatter: function(log, config) {
			
			console.log('log ->', log)
			// eyes.inspect(log)
			// console.log('config ->', config)
			// eyes.inspect(config)
			
			return 'this formatter'

		} as Pino.PrettyFormatter,
		forceColor: true, levelFirst: true,
	},
})
logger.addLevel('log', 25)



// {
// 	['log', 'info', 'warn', 'error'].forEach(function(key) {
// 		console[key] = function(...args) {
// 			logger[key].apply(logger, [util.format.apply(util.format, Array.prototype.slice.call(args))])
// 		}
// 	})
// }

const loglogger = function(...args) {
	logger.log.apply(logger, [util.format.apply(util.format, Array.prototype.slice.call(args))])
}

let error = boom.internal('awesome internal error')
logger.log('boom.internal Error ->', error)



export default logger





// import * as fs from 'fs'
// const dest = fs.createWriteStream('dest/logger.log')
// dest.write = function(message, next) {
// 	console.log('dest.write message ->', message)
// 	next()
// 	return true
// 	// process.stdout.write('dest.write message ->' + message)
// }


