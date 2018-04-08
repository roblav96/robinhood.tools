// 

import '../common/polyfills'
import 'source-map-support/register'

global.Promise = require('bluebird')
global.WebSocket = require('uws')

global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

// if (DEVELOPMENT) process.INSTANCES = 0;
import './process'
import './adapters/console'

console.log('process.INSTANCE ->', process.INSTANCE)

import './api/fastify'

// import '../common/clock'
// import './adapters/radio'
// import './adapters/redis'

// import './adapters/cluster'

// import './watchers/robinhood.instruments'
// import './watchers/webull.tickers'

// if (process.WORKER) {
// 	import('./api/fastify')
// }


