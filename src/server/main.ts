// 

import '../common/polyfills'
import 'source-map-support/register'

global.Promise = require('bluebird')
global.WebSocket = require('uws')

import './process'

import './adapters/console'
if (DEVELOPMENT) process.INSTANCES = 0;
import './adapters/cluster'

import '../common/clock'
import './adapters/radio'
import './adapters/redis'
import './watchers/watchers'

if (process.WORKER) {
	require('./api/fastify')
}


