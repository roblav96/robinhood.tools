// 

import * as moleculer from 'moleculer'
import * as Mts from 'moleculer-decorators'



export default {
	logger: false,
	logLevel: 'debug',
	circuitBreaker: { enabled: false },
	metrics: false,
	statistics: false,
} as moleculer.BrokerOptions


