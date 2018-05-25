// 

import '../main'
import * as moleculer from 'moleculer'
import * as Mts from 'moleculer-decorators'



module.exports = {
	nodeID: 'moleculer.config',
	logger: true,
	logLevel: 'error',
	logFormatter: (level, args, bindings) => `🔹 ${args.join(' ')}`,
	// circuitBreaker: { enabled: false },
	// metrics: false,
	// statistics: false,
} as moleculer.BrokerOptions


