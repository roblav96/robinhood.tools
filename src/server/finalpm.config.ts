// 

import * as _ from 'lodash'
import * as finalpm from 'final-pm'



module.exports = function() {
	return {
		'applications': [{
			'name': 'robinhood-service',
			'run': 'services/robinhood.service.js',
			'mode': 'cluster',
			'instances': 2,
			'ready-on': 'message',
			// 'stop-signal': 'SIGKILL',
			// 'kill-signal': 'SIGKILL',
		}],
	} as finalpm.Configuration
}


