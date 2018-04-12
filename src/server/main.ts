// 

require('../common/polyfills')
require('source-map-support').install()

process.env.NODE_ENV = ['development', 'production'].includes(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development'
global.NODE_ENV = process.env.NODE_ENV
global.DEVELOPMENT = NODE_ENV == 'development'
global.PRODUCTION = NODE_ENV == 'production'
global.Promise = require('bluebird')
global.WebSocket = require('uws')

// if (DEVELOPMENT) process.DEBUGGING = true;

import './adapters/process'
import './adapters/console'
import './adapters/pm2'
import './services/exit'

import '../common/clock'
import './api/fastify'
import './adapters/radio'

import './watchers/watchers'


