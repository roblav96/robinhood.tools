// 

import * as final from 'final-pm'



const config = [{
	'name': 'robinhood-service',
	// 'run': 'services/robinhood.service.js',
	'run': 'final/polka.js',
	'mode': 'cluster',
	'instances': 2,
	'ready-on': 'message',
	// 'logger': 'idk-logger',
	'logger-args': ['dont', 'log', '...'],
	'stop-signal': 'disconnect',
}] as final.Application[]



module.exports = {
	applications: config,
} as final.Configuration


