// 

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
global.NODE_ENV = process.env.NODE_ENV
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

import '../common/polyfills'
import 'source-map-support/register'

global.Promise = require('bluebird')
global.WebSocket = require('uws')

import './adapters/process'
import './adapters/console'
// import './services/cleanup'
// import './adapters/cluster'

import '../common/clock'
import './api/fastify'
// import './adapters/radio'

// import './watchers/robinhood.instruments'
// import './watchers/webull.tickers'



// // import chalk from 'chalk'
// // import * as os from 'os'
// import * as cluster from 'cluster'
// // import * as uws from './modules/uws'

// if (process.PRIMARY) {
// 	// console.log('uws ->', console.dump(uws, { depth: 8 }))
// 	// console.log('uws.http ->', console.dump(uws.http, { depth: 8 }))
// 	// console.log('uws.native ->', console.dump(uws.native, { depth: 8 }))
// 	// console.warn('uws ->', console.dtsgen(uws))
// 	// console.log('process.argv ->', console.inspect(process.argv))
// 	// console.log('process.env ->', console.inspect(process.env))
// 	console.log('cluster.isMaster ->', console.inspect(cluster.isMaster))
// 	console.log('cluster.isWorker ->', console.inspect(cluster.isWorker))
// }


