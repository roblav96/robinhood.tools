// 

import '../common/polyfills'

if (!['development', 'production'].includes(process.env.NODE_ENV)) process.env.NODE_ENV = 'development'
global.NODE_ENV = process.env.NODE_ENV
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'

// process.env.NODE_HEAPDUMP_OPTIONS = 'nosignal'
// import * as appmetrics from 'appmetrics'
// appmetrics.configure({
// 	'mqtt': 'off',
// 	'profiling': 'off',
// })
// appmetrics.start()

import * as sourcemaps from 'source-map-support'
sourcemaps.install()

global.Promise = require('bluebird')
global.WebSocket = require('uws')

// process.DEBUGGERS = 1
process.INSTANCES = 1

import './adapters/process'
import './adapters/console'
import './adapters/cluster'

import '../common/clock'
import './api/fastify'
import './adapters/radio'

import './stocks/stocks'



// import * as appmetricsdash from 'appmetrics-dash'
// appmetricsdash.monitor({
// 	host: process.HOST,
// 	port: 3001 + process.INSTANCE,
// })


