// 

require('../common/polyfills')
require('source-map-support').install()

global.NODE_ENV = process.env.NODE_ENV || 'development'
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'
global.Promise = require('bluebird')
global.WebSocket = require('uws')

// if (DEVELOPMENT) process.INSTANCES = 2;
import './adapters/process'
import './adapters/console'
import './services/cleanup'

import '../common/clock'
import './api/fastify'
import './adapters/cluster'
import './adapters/radio'

import './watchers/watchers'





// import * as Promise from 'bluebird'
// declare global {
// 	interface Promise<T> extends Promise<T> {

// 	}
// 	class PromiseConstructor {
// 		attempt: typeof Promise.attempt
// 	}
// 	var Promise: PromiseConstructor
// }

// Promise.resolve().then(function() {

// }).finally


