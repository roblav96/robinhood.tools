// 

import '../common/polyfills'

if (!['development', 'production'].includes(process.env.NODE_ENV)) process.env.NODE_ENV = 'development'
global.NODE_ENV = process.env.NODE_ENV
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

// process.INSTANCE = process.env.NODE_APP_INSTANCE ? Number.parseInt(process.env.NODE_APP_INSTANCE) : 0
// process.env.NODE_HEAPDUMP_OPTIONS = 'nosignal'
// import * as appmetrics from 'appmetrics'
// import * as appmetricsdash from 'appmetrics-dash'
// // appmetricsdash.attach()
// appmetricsdash.monitor({
// 	port: 3001 + process.INSTANCE,
// })

import * as sourcemaps from 'source-map-support'
sourcemaps.install()

global.Promise = require('bluebird')
global.WebSocket = require('uws')

// process.DEBUGGERS = 1
// process.INSTANCES = 1

import './adapters/process'
import './adapters/console'
import './adapters/cluster'

import '../common/clock'
import './api/fastify'
import './adapters/radio'

import './stocks/stocks'


