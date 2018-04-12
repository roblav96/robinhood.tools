// 

require('../common/polyfills')
require('source-map-support').install()

global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'
global.Promise = require('bluebird')
global.WebSocket = require('uws')

if (DEVELOPMENT) {
	// process.DEBUGGING = true
	// process.INSTANCES = 1
}

import './adapters/process'
import './adapters/console'
// import './services/cleanup'

import '../common/clock'
import './api/fastify'
import './adapters/cluster'
import './adapters/radio'

import './watchers/watchers'


