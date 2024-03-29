//

// global.Promise = require('zousan')
global.WebSocket = require('ws')

require('../common/polyfills')
require('bluebird').config({ warnings: { wForgottenReturn: false } })
require('source-map-support/register')

import './adapters/process'
import './adapters/console'
import './adapters/radio'
import '../common/clock'
