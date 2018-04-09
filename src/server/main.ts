// 

import '../common/polyfills'
import 'source-map-support/register'

global.Promise = require('bluebird')
global.WebSocket = require('uws')

global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

import './adapters/process'
import './adapters/console'
import './services/cleanup'

import '../common/clock'
import './api/fastify'
// import './adapters/cluster'
// import './adapters/radio'

// import './watchers/robinhood.instruments'
// import './watchers/webull.tickers'



// import chalk from 'chalk'
// import * as os from 'os'
// import * as cluster from 'cluster'

// if (process.PRIMARY) {
	console.log('process.argvs ->', console.inspect(process.argv))
// 	console.log('process.env ->', console.inspect(process.env))
// 	console.log('cluster.isMaster ->', console.inspect(cluster.isMaster))
// 	console.log('cluster.isWorker ->', console.inspect(cluster.isWorker))
// }


