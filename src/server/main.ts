// 

import '../common/polyfills'
import 'source-map-support/register'

import './process'

import './adapters/console'
if (DEVELOPMENT) process.INSTANCES = 0;
import './adapters/cluster'

global.WebSocket = require('uws')

import '../common/ticks'
import './adapters/radio'
import './adapters/redis'
import './watchers/watchers'

if (process.WORKER) require('./api/fastify');


