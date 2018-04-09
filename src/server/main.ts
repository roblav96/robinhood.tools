// 

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
global.NODE_ENV = process.env.NODE_ENV
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

require('../common/polyfills')
require('source-map-support').install()

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



import chalk from 'chalk'
import * as os from 'os'
import * as cluster from 'cluster'

// if (process.PRIMARY) {
// console.log('process.argv ->', console.inspect(process.argv))
// console.log('process.env ->', console.inspect(process.env))
console.log('cluster.isMaster ->', console.inspect(cluster.isMaster))
console.log('cluster.isWorker ->', console.inspect(cluster.isWorker))
// }


