// 

import '../common/polyfills'

global.Promise = require('zousan/src/zousan')
global.Zousan.suppressUncaughtRejectionError = true
require('bluebird').config({ warnings: { wForgottenReturn: false } })

import * as sourcemaps from 'source-map-support'
sourcemaps.install()

import './adapters/process'
import './adapters/console'
import '../common/clock'

global.WebSocket = require('uws')
import './adapters/radio'


