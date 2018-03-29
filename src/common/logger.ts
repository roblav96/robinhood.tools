// 

import * as util from 'util'
import * as Pino from 'pino'



const logger = Pino({
	level: 'debug',
	prettyPrint: {
		forceColor: true,
		levelFirst: true,
	},
})

const cls = ['log', 'info', 'warn', 'error']
cls.forEach(function(key) {
	console[key] = function(...args) {
		if (key == 'log') key = 'info';
		logger[key].apply(logger, [util.format.apply(util.format, Array.prototype.slice.call(args))])
		// logger[key].apply(logger, util.inspect(args))
	}
})



export default logger


